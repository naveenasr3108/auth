const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const auth = require('../middlewares/auth');

// Create task
router.post('/teams/:teamId/tasks', auth, createTask);

// Get tasks
router.get('/teams/:teamId/tasks', auth, getTasks);

// Update task
router.put('/tasks/:id', auth, updateTask);

// Delete task
router.delete('/tasks/:id', auth, deleteTask);

module.exports = router;