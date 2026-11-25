const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const { paginationSchema } = require("../validation/paginationSchema");
const prisma = require("../db/prisma");

/* ------- HELPER FUNCTIONS ------- */
const getOrderBy = (query) => {
  const validSortFields = [
    "title",
    "priority",
    "createdAt",
    "id",
    "isCompleted",
  ];
  const sortBy = query.sortBy || "createdAt";
  const sortDirection = query.sortDirection === "asc" ? "asc" : "desc";

  if (validSortFields.includes(sortBy)) {
    return { [sortBy]: sortDirection };
  }
  return { createdAt: "desc" };
};

/* ------- CONTROLLER FUNCTIONS ------- */
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

  const { title, isCompleted, priority } = value;
  const task = await prisma.task.create({
    data: { title, isCompleted, priority, userId: req.user.id },
    select: {
      id: true,
      title: true,
      isCompleted: true,
      priority: true,
      createdAt: true,
    },
  });

  res.status(201).json(task);
}

async function index(req, res) {
  const { error, value } = paginationSchema.validate({
    page: req.query.page,
    limit: req.query.limit,
  });
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  const { page, limit } = value;
  const skip = (page - 1) * limit;

  const whereClause = { userId: req.user.id };
  if (req.query.find) {
    whereClause.title = {
      contains: req.query.find,
      mode: "insensitive",
    };
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      isCompleted: true,
      priority: true,
      createdAt: true,
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    skip: skip,
    take: limit,
    orderBy: getOrderBy(req.query),
  });

  if (tasks.length === 0) {
    return res.status(404).json({ message: "No task found" });
  }

  const totalTasks = await prisma.task.count({
    where: whereClause,
  });

  const pagination = {
    page,
    limit,
    total: totalTasks,
    pages: Math.ceil(totalTasks / limit),
    hasNext: page * limit < totalTasks,
    hasPrev: page > 1,
  };

  res.status(200).json({ tasks, pagination });
}

async function show(req, res) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: req.user.id },
    select: {
      id: true,
      title: true,
      isCompleted: true,
      priority: true,
      createdAt: true,
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!task) {
    return res.status(404).json({ message: "No task found" });
  }

  res.status(200).json(task);
}

async function update(req, res, next) {
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

  try {
    const task = await prisma.task.update({
      data: value,
      where: {
        id: taskId,
        userId: req.user.id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
      },
    });
    res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err);
    }
  }
}

async function deleteTask(req, res, next) {
  const taskId = parseInt(req.params?.id);
  if (!taskId) return res.status(400).json({ message: "Invalid Task ID" });

  try {
    const task = await prisma.task.delete({
      where: {
        id: taskId,
        userId: req.user.id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
      },
    });
    res.status(200).json(task);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "No task found." });
    } else {
      return next(err);
    }
  }
}

async function bulkCreate(req, res, next) {
  if (!req.body) req.body = {};
  const { tasks } = req.body;

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      error: "Invalid request data. Expected an array of tasks.",
    });
  }

  const validTasks = [];
  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }
    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted || false,
      priority: value.priority || "medium",
      userId: req.user.id,
    });
  }

  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false,
    });

    res.status(201).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, index, show, update, deleteTask, bulkCreate };
