const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['irrigation', 'fertilizer', 'pest-control', 'harvesting', 'planting', 'maintenance', 'other'],
    default: 'other'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
todoSchema.index({ farmer: 1, status: 1 });
todoSchema.index({ farmer: 1, completed: 1 });

module.exports = mongoose.model('Todo', todoSchema);
