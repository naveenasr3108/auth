const express = require('express');
const router = express.Router();

const {
  createTeam,
  getTeams,
  deleteTeam,
  inviteMember,
  acceptInvitation,
  getTeamMembers,
  updateMemberRole,
  removeMember
} = require('../controllers/teamController');

const auth = require('../middlewares/auth');

// Create team
router.post('/', auth, createTeam);

// Get all teams of logged-in user
router.get('/', auth, getTeams);

// Delete team (admin)
router.delete('/:teamId', auth, deleteTeam);

// Invite member
router.post('/:teamId/invite', auth, inviteMember);

// Accept invitation
router.post('/invitations/:inviteId/accept', auth, acceptInvitation);

// Get members
router.get('/:teamId/members', auth, getTeamMembers);

// Update role
router.put('/:teamId/members/:userId', auth, updateMemberRole);

// Remove member
router.delete('/:teamId/members/:userId', auth, removeMember);

module.exports = router;