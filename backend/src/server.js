require('dotenv').config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env"
});

const express = require('express');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const errorHandler = require('./middlewares/errorHandler');

const app = express();

/* ================= SECURITY ================= */
app.use(helmet());

// ✅ IMPORTANT FIX: allow BOTH localhost & 127.0.0.1
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / curl

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ VERY IMPORTANT (preflight)

app.use(express.json());

/* ================= RATE LIMIT ================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

/* ================= DB + AUTH ================= */
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middlewares/auth');
const { addToken, hasToken } = require('./tokenStore');

/* ================= ROUTES ================= */
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/teams', teamRoutes);
app.use('/api', taskRoutes);

/* ================= REGISTER ================= */
app.post(
  '/api/auth/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { name, email, password } = req.body;

      const userCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        [name, email, hashedPassword]
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully'
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

/* ================= LOGIN ================= */
app.post(
  '/api/auth/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { email, password } = req.body;

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password'
        });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
      );

      addToken(refreshToken);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

/* ================= REFRESH ================= */
app.post('/api/auth/refresh', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false });
  }

  if (!hasToken(token)) {
    return res.status(403).json({ success: false });
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false });

    const newAccessToken = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    res.json({
      success: true,
      data: { accessToken: newAccessToken }
    });
  });
});

/* ================= TEST ================= */
app.get('/', (req, res) => {
  res.send('Server is working');
});

/* ================= ERROR ================= */
app.use(errorHandler);

/* ================= START ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});