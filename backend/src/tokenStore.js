let refreshTokens = [];

const addToken = (token) => {
  refreshTokens.push(token);
};

const removeToken = (token) => {
  refreshTokens = refreshTokens.filter(t => t !== token);
};

const hasToken = (token) => {
  return refreshTokens.includes(token);
};

module.exports = {
  addToken,
  removeToken,
  hasToken
};