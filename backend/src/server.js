require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// DB + Auth utils
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middlewares/auth');
const { addToken, hasToken } = require('./tokenStore');

// ROUTES
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/taskRoutes'); // ✅ ADD THIS

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTE WIRING
app.use('/api/teams', teamRoutes);
app.use('/api', taskRoutes); // ✅ VERY IMPORTANT

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

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
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
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
});

// REFRESH TOKEN
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
    message: 'Protected route working ✅',
    user: req.user
  });
});

// START SERVER
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});