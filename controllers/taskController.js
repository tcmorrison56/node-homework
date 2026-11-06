const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const pool = require("../db/pg-pool");

async function create(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const createResult = await pool.query(
    `INSERT INTO tasks (title, is_completed, user_id)
    VALUES ($1, $2, $3)
    RETURNING id, title, is_completed AS "isCompleted"`,
    [value.title, value.isCompleted, global.user_id],
  );

  const createTask = createResult.rows[0];
  res.status(201).json(createTask);
}

async function index(req, res) {
  const indexResult = await pool.query(
    `SELECT id, title, is_completed AS "isCompleted" FROM tasks WHERE user_id = $1`,
    [global.user_id],
  );

  if (indexResult.rows.length === 0) {
    return res.status(404).json({ message: "No task found" });
  }

  const indexTasks = indexResult.rows;
  res.status(200).json(indexTasks);
}

async function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  const showResult = await pool.query(
    `SELECT id, title, is_completed AS "isCompleted" FROM tasks WHERE user_id = $1 AND id = $2`,
    [global.user_id, taskId],
  );

  if (showResult.rows.length === 0)
    return res.status(404).json({ message: "No task found" });

  const showTask = showResult.rows[0];
  res.status(200).json(showTask);
}

async function update(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  let keys = Object.keys(value);
  keys = keys.map((key) => (key === "isCompleted" ? "is_completed" : key));
  const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const idParm = `$${keys.length + 1}`;
  const userParm = `$${keys.length + 2}`;
  const updateResult = await pool.query(
    `UPDATE tasks SET ${setClauses} WHERE id = ${idParm} AND user_id = ${userParm} RETURNING id, title, is_completed AS "isCompleted"`,
    [...Object.values(value), taskId, global.user_id],
  );

  if (updateResult.rows.length === 0) {
    return res.status(404).json({ message: "No task found" });
  }

  const updatedTask = updateResult.rows[0];
  res.status(200).json(updatedTask);
}

async function deleteTask(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) return res.status(400).json({ message: "Invalid Task ID" });

  const deleteResult = await pool.query(
    `DELETE FROM tasks WHERE user_id = $1 AND id = $2 RETURNING id, title, is_completed AS "isCompleted"`,
    [global.user_id, taskId],
  );

  if (deleteResult.rows.length === 0) {
    return res.status(404).json({ message: "No task found" });
  }

  const deletedTask = deleteResult.rows[0];
  res.status(200).json(deletedTask);
}

module.exports = { create, index, show, update, deleteTask };
