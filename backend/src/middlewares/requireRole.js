const pool = require('../config/db');

const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const teamId = req.params.teamId;

      const result = await pool.query(
        'SELECT role FROM team_members WHERE user_id = $1 AND team_id = $2',
        [userId, teamId]
      );

      if (
        !result.rows[0] ||
        !allowedRoles.includes(result.rows[0].role)
      ) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      req.userRole = result.rows[0].role;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = requireRole;