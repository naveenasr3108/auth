const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { acceptInvitation } = require('../controllers/teamController');

// POST /api/invitations/:token/accept
router.post('/:token/accept', authMiddleware, acceptInvitation);

module.exports = router;