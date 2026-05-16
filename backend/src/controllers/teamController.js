const pool = require('../config/db');
const crypto = require('crypto');

// create team
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const team = await pool.query(
      'INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );

    // Add creator as admin
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

// get team
const getTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [teamId]
    );

    res.json(team.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching team' });
  }
};

// delete team
const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting team' });
  }
};

// invite member
const inviteMember = async (req, res) => {
  try {
    const teamId = req.params.teamId; // ✅ FIXED
    const { email } = req.body;

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO invitations (team_id, email, token, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [teamId, email, token, expiresAt]
    );

    const inviteLink = `http://localhost:5000/api/invitations/${token}/accept`;

    res.status(201).json({
      message: 'Invitation created ✅',
      inviteLink,
      invitation: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating invitation' });
  }
};

// accept invitation
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.userId;

    const invite = await pool.query(
      'SELECT * FROM invitations WHERE token = $1',
      [token]
    );

    if (invite.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid invitation' });
    }

    const invitation = invite.rows[0];

    // expiry check
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    // prevent duplicate join (🔥 improvement)
    const existing = await pool.query(
      'SELECT * FROM team_members WHERE user_id = $1 AND team_id = $2',
      [userId, invitation.team_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member' });
    }

    // add to team
    await pool.query(
      'INSERT INTO team_members (user_id, team_id, role) VALUES ($1, $2, $3)',
      [userId, invitation.team_id, 'member']
    );

    // delete invitation
    await pool.query(
      'DELETE FROM invitations WHERE token = $1',
      [token]
    );

    res.json({ message: 'Joined team successfully ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error accepting invitation' });
  }
};
const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const members = await pool.query(
      `SELECT users.id, users.name, users.email, team_members.role
       FROM team_members
       JOIN users ON users.id = team_members.user_id
       WHERE team_members.team_id = $1`,
      [teamId]
    );

    res.json(members.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching team members' });
  }
};
const updateMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    await pool.query(
      'UPDATE team_members SET role = $1 WHERE user_id = $2 AND team_id = $3',
      [role, userId, teamId]
    );

    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating role' });
  }
};
const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    await pool.query(
      'DELETE FROM team_members WHERE user_id = $1 AND team_id = $2',
      [userId, teamId]
    );

    res.json({ message: 'Member removed from team' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error removing member' });
  }
};
module.exports = {
  createTeam,
  getTeam,
  deleteTeam,
  inviteMember,
  acceptInvitation,
  getTeamMembers,
  updateMemberRole,
  removeMember
};