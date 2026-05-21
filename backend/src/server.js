require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");

const app = express();

// SECURITY MIDDLEWARE
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// DB + Auth utils
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middlewares/auth');
const { addToken, hasToken } = require('./tokenStore');

// ROUTES
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/taskRoutes');

// ROUTE WIRING
app.use('/api/teams', teamRoutes);
app.use('/api', taskRoutes);

app.post(
  '/api/auth/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      const userCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        [name, email, hashedPassword]
      );

      res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

app.post(
  '/api/auth/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      addToken(refreshToken);

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

app.post('/api/auth/refresh', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  if (!hasToken(token)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Expired token' });
    }

    const newAccessToken = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  });
});

// TEST ROUTES
app.get('/', (req, res) => {
  res.send('Server is working');
});

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Protected route working',
    user: req.user
  });
});

// START SERVER
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});