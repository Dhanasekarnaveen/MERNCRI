const Task = require('../models/Task');
const Lead = require('../models/Lead');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, leadId, assignedTo, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (leadId) {
      query.lead = leadId;
    }

    if (assignedTo && assignedTo !== 'All') {
      query.assignedTo = assignedTo;
    }

    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('lead', 'name email phone status isDeleted')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    // Filter out tasks where the lead is soft-deleted
    const validTasks = tasks.filter((task) => task.lead && !task.lead.isDeleted);

    res.json({
      success: true,
      count: validTasks.length,
      data: validTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('lead', 'name email phone status')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task for a lead
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, lead, assignedTo, dueDate, status } = req.body;

    if (!title || !lead || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, lead, assigned user, and due date',
      });
    }

    // Verify lead exists and is not soft deleted
    const leadExists = await Lead.findById(lead);
    if (!leadExists || leadExists.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'The selected lead does not exist or has been deleted',
      });
    }

    const task = await Task.create({
      title,
      description: description || '',
      lead,
      assignedTo,
      dueDate,
      status: status || 'Pending',
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('lead', 'name email phone status')
      .populate('assignedTo', 'name email role');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (STRICT AUTHORIZATION: Only assigned users can update task status)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Completed'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // CRITICAL REQUIREMENT ENFORCEMENT:
    // "Only assigned users can update task status."
    const isAssignedUser = task.assignedTo.toString() === req.user._id.toString();

    if (!isAssignedUser) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the assigned user is authorized to update this task status.',
      });
    }

    task.status = status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('lead', 'name email phone status')
      .populate('assignedTo', 'name email role');

    res.json({
      success: true,
      data: populatedTask,
      message: 'Task status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // If status is being updated, verify user is assignedTo
    if (req.body.status && req.body.status !== task.status) {
      const isAssignedUser = task.assignedTo.toString() === req.user._id.toString();
      if (!isAssignedUser) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only the assigned user can change the status of this task.',
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('lead', 'name email phone status')
      .populate('assignedTo', 'name email role');

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
