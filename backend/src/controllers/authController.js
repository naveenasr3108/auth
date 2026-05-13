const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const user = {
    id: 1,
    email: 'test@gmail.com'
  };

  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });

  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  });

  res.json({
    accessToken,
    refreshToken
  });
};

module.exports = { login };