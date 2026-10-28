const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return function () {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

function create(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  const newTask = {
    id: taskCounter(),
    userId: global.user_id.email,
    ...value,
  };
  const { userId, ...sanitizedTask } = newTask;
  global.tasks.push(newTask);
  res.status(201).json(sanitizedTask);
}

function index(req, res) {
  const userTasks = global.tasks.filter(
    (task) => task.userId === global.user_id.email,
  );
  if (userTasks.length === 0) {
    return res.status(404).json({ message: "No task found" });
  }
  const sanitizedTasks = userTasks.map(({ userId, ...task }) => task);
  res.status(200).json(sanitizedTasks);
}

function show(req, res) {
  console.log(req.params);
  const taskId = parseInt(req.params?.id);
  console.log(taskId);
  if (!taskId) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }
  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );
  if (!task) return res.status(404).json({ message: "No task found" });
  const { userId, ...sanitizedTask } = task;
  res.status(200).json(sanitizedTask);
}

function update(req, res) {
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

  const task = global.tasks.find(
    (task) => task.id === taskId && task.userId === global.user_id.email,
  );
  if (!task) return res.status(404).json({ message: "No task found" });
  Object.assign(task, value);

  const { userId, ...sanitizedTask } = task;
  res.status(200).json(sanitizedTask);
}

function deleteTask(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) return res.status(400).json({ message: "Invalid Task ID" });
  const index = global.tasks.findIndex(
    (task) => taskId === task.id && task.userId === global.user_id.email,
  );

  if (index === -1) {
    return res.status(404).json({ message: "No task found" });
  }

  const [deletedTask] = global.tasks.splice(index, 1);
  const { userId, ...sanitizedTask } = deletedTask;
  res.status(200).json(sanitizedTask);
}

module.exports = { create, index, show, update, deleteTask };
