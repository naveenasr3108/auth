const pool = require('../config/db');

// create team
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const team = await pool.query(
      'INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );

    // Add creator as admin in team_members
    await pool.query(
      'INSERT INTO team_members (user_id, team_id, role) VALUES ($1, $2, $3)',
      [userId, team.rows[0].id, 'admin']
    );

    res.status(201).json(team.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating team' });
  }
};


// get team (only members)
const getTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [teamId]
    );

    res.json(team.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching team' });
  }
};


// delete team (admin only)
const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting team' });
  }
};

module.exports = {
  createTeam,
  getTeam,
  deleteTeam
};