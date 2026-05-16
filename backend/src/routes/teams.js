const express = require('express');
const router = express.Router();

const {
  createTeam,
  getTeam,
  deleteTeam,
  inviteMember,
  acceptInvitation,
  getTeamMembers,
  updateMemberRole,
  removeMember
} = require('../controllers/teamController');

const authenticateToken = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

// Create team (any logged-in user)
router.post('/', authenticateToken, createTeam);

// Get team (only members)
router.get('/:teamId', authenticateToken, requireRole(['admin','member']), getTeam);

// Delete team (admin only)
router.delete('/:teamId', authenticateToken, requireRole(['admin']), deleteTeam);

// Invite member (admin only)
router.post('/:teamId/invite', authenticateToken, requireRole(['admin']), inviteMember);

// Accept invitation
router.post('/invitations/:token/accept', authenticateToken, acceptInvitation);

// Get team members
router.get('/:teamId/members',
  authenticateToken,
  requireRole(['admin','member']),
  getTeamMembers
);

// Update member role (admin only)
router.put('/:teamId/members/:userId',
  authenticateToken,
  requireRole(['admin']),
  updateMemberRole
);

// Remove member (admin only)
router.delete('/:teamId/members/:userId',
  authenticateToken,
  requireRole(['admin']),
  removeMember
);

module.exports = router;