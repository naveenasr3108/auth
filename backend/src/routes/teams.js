const express = require('express');
const router = express.Router();

const { createTeam, getTeam, deleteTeam } = require('../controllers/teamController');
const authenticateToken = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

// Create team (any logged-in user)
router.post('/', authenticateToken, createTeam);

// Get team (only members)
router.get('/:teamId', authenticateToken, requireRole(['admin', 'member']), getTeam);

// Delete team (admin only)
router.delete('/:teamId', authenticateToken, requireRole(['admin']), deleteTeam);

module.exports = router;