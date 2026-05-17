const pool = require('../config/db');

// CREATE TEAM
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `INSERT INTO teams (name, created_by)
       VALUES ($1, $2)
       RETURNING *`,
      [name, userId]
    );

    const team = result.rows[0];

    // Add creator as admin
    await pool.query(
      `INSERT INTO team_members (user_id, team_id, role)
       VALUES ($1, $2, $3)`,
      [userId, team.id, 'admin']
    );

    res.status(201).json(team);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating team' });
  }
};

// GET USER TEAMS
const getTeams = async (req, res) => {
  try {
    const userId = req.user.userId;

    const teams = await pool.query(
      `SELECT t.*
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1`,
      [userId]
    );

    res.json(teams.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching teams' });
  }
};

// DELETE TEAM (ONLY ADMIN)
const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId;

    const member = await pool.query(
      `SELECT * FROM team_members
       WHERE user_id = $1 AND team_id = $2`,
      [userId, teamId]
    );

    if (member.rows.length === 0 || member.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete team' });
    }

    await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);

    res.json({ message: 'Team deleted successfully ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting team' });
  }
};

// INVITE MEMBER
const inviteMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body;
    const userId = req.user.userId;

    // Check admin
    const member = await pool.query(
      `SELECT * FROM team_members
       WHERE user_id = $1 AND team_id = $2`,
      [userId, teamId]
    );

    if (member.rows.length === 0 || member.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can invite' });
    }

    const invite = await pool.query(
      `INSERT INTO invitations (team_id, email, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [teamId, email]
    );

    res.status(201).json(invite.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending invite' });
  }
};

// ACCEPT INVITATION
const acceptInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.userId;

    const inviteResult = await pool.query(
      `SELECT * FROM invitations WHERE id = $1`,
      [inviteId]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    const invite = inviteResult.rows[0];

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Invite already used' });
    }

    // Add to team
    await pool.query(
      `INSERT INTO team_members (user_id, team_id, role)
       VALUES ($1, $2, 'member')`,
      [userId, invite.team_id]
    );

    // Mark accepted
    await pool.query(
      `UPDATE invitations SET status = 'accepted'
       WHERE id = $1`,
      [inviteId]
    );

    res.json({ message: 'Joined team successfully ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error accepting invite' });
  }
};

// GET TEAM MEMBERS
const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const members = await pool.query(
      `SELECT u.id, u.email, tm.role
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1`,
      [teamId]
    );

    res.json(members.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching members' });
  }
};

// UPDATE MEMBER ROLE (ADMIN ONLY)
const updateMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;
    const currentUser = req.user.userId;

    const adminCheck = await pool.query(
      `SELECT * FROM team_members
       WHERE user_id = $1 AND team_id = $2`,
      [currentUser, teamId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update roles' });
    }

    await pool.query(
      `UPDATE team_members
       SET role = $1
       WHERE user_id = $2 AND team_id = $3`,
      [role, userId, teamId]
    );

    res.json({ message: 'Role updated successfully ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating role' });
  }
};

// REMOVE MEMBER (ADMIN ONLY)
const removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const currentUser = req.user.userId;

    const adminCheck = await pool.query(
      `SELECT * FROM team_members
       WHERE user_id = $1 AND team_id = $2`,
      [currentUser, teamId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can remove members' });
    }

    await pool.query(
      `DELETE FROM team_members
       WHERE user_id = $1 AND team_id = $2`,
      [userId, teamId]
    );

    res.json({ message: 'Member removed successfully ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error removing member' });
  }
};

module.exports = {
  createTeam,
  getTeams,
  deleteTeam,
  inviteMember,
  acceptInvitation,
  getTeamMembers,
  updateMemberRole,
  removeMember
};