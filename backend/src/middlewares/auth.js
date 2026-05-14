const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log("AUTH HEADER 👉", authHeader);

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          error: 'Invalid or expired token'
        });
      }

      req.user = user;

      next();
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Server error in authentication'
    });
  }
};

module.exports = authenticateToken;