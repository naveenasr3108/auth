const pool = require('../config/db');

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, assigned_to } = req.body;
    const userId = req.user.userId;

    // Check if user is part of the team
    const member = await pool.query(
      'SELECT * FROM team_members WHERE user_id = $1 AND team_id = $2',
      [userId, teamId]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, team_id, created_by, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, teamId, userId, assigned_to]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating task' });
  }
};

// GET TASKS
const getTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId;
    const { status, assigned_to, startDate, endDate } = req.query;

    // Check membership
    const member = await pool.query(
      'SELECT * FROM team_members WHERE user_id = $1 AND team_id = $2',
      [userId, teamId]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    let query = `SELECT * FROM tasks WHERE team_id = $1`;
    let values = [teamId];
    let count = 2;

    if (status) {
      query += ` AND status = $${count++}`;
      values.push(status);
    }

    if (assigned_to) {
      query += ` AND assigned_to = $${count++}`;
      values.push(assigned_to);
    }

    if (startDate) {
      query += ` AND created_at >= $${count++}`;
      values.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= $${count++}`;
      values.push(endDate);
    }

    query += ` ORDER BY created_at DESC`;

    const tasks = await pool.query(query, values);

    res.json(tasks.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    const userId = req.user.userId;

    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    // Check membership
    const member = await pool.query(
      'SELECT * FROM team_members WHERE user_id = $1 AND team_id = $2',
      [userId, task.team_id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    const role = member.rows[0].role;

    // Reassignment rule
    if (assigned_to && assigned_to !== task.assigned_to) {
      if (role !== 'admin' && userId !== task.assigned_to) {
        return res.status(403).json({ error: 'Not allowed to reassign' });
      }
    }

    const updated = await pool.query(
      `UPDATE tasks
       SET status = COALESCE($1, status),
           assigned_to = COALESCE($2, assigned_to)
       WHERE id = $3
       RETURNING *`,
      [status, assigned_to, id]
    );

    res.json(updated.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating task' });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    // Check membership
    const member = await pool.query(
      'SELECT * FROM team_members WHERE user_id = $1 AND team_id = $2',
      [userId, task.team_id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    const role = member.rows[0].role;

    if (role !== 'admin' && userId !== task.created_by) {
      return res.status(403).json({
        error: 'Only admin or creator can delete'
      });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    res.json({ message: 'Task deleted successfully ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting task' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
};