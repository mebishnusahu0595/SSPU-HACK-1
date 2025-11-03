const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Todo = require('../models/Todo.model');
const Activity = require('../models/Activity.model');

// @route   GET /api/todos
// @desc    Get all todos for logged-in farmer
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const todos = await Todo.find({ farmer: req.farmer._id })
      .sort({ completed: 1, priority: -1, dueDate: 1, createdAt: -1 });

    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch todos'
    });
  }
});

// @route   POST /api/todos
// @desc    Create a new todo
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const todo = await Todo.create({
      farmer: req.farmer._id,
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      category: category || 'other'
    });

    // Log activity
    await Activity.create({
      farmer: req.farmer._id,
      type: 'todo_created',
      title: 'New Task Added',
      description: `Created task: ${title}`,
      icon: '✅',
      metadata: { todoId: todo._id }
    });

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create todo'
    });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, category, completed } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    // Update fields
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (priority !== undefined) todo.priority = priority;
    if (status !== undefined) todo.status = status;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (category !== undefined) todo.category = category;
    
    if (completed !== undefined) {
      todo.completed = completed;
      if (completed && !todo.completedAt) {
        todo.completedAt = new Date();
        
        // Log activity for completion
        await Activity.create({
          farmer: req.farmer._id,
          type: 'todo_completed',
          title: 'Task Completed',
          description: `Completed: ${todo.title}`,
          icon: '🎉',
          metadata: { todoId: todo._id }
        });
      }
    }

    await todo.save();

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update todo'
    });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      farmer: req.farmer._id
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete todo'
    });
  }
});

// @route   GET /api/todos/stats
// @desc    Get todo statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Todo.countDocuments({ farmer: req.farmer._id });
    const completed = await Todo.countDocuments({ farmer: req.farmer._id, completed: true });
    const pending = await Todo.countDocuments({ farmer: req.farmer._id, completed: false });
    const highPriority = await Todo.countDocuments({ 
      farmer: req.farmer._id, 
      completed: false, 
      priority: 'high' 
    });

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        highPriority
      }
    });
  } catch (error) {
    console.error('Get todo stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch todo stats'
    });
  }
});

module.exports = router;
