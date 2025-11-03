import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaPlus, FaTrash, FaEdit, FaFlag, FaCalendar, FaTasks } from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FarmTodo() {
  const [isOpen, setIsOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'other'
  });

  useEffect(() => {
    if (isOpen) {
      fetchTodos();
    }
  }, [isOpen]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/todos');
      if (response.data?.success) {
        setTodos(response.data.data);
      }
    } catch (error) {
      console.error('Fetch todos error:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      if (editingTodo) {
        // Update existing todo
        const response = await api.put(`/todos/${editingTodo._id}`, formData);
        if (response.data?.success) {
          setTodos(todos.map(t => t._id === editingTodo._id ? response.data.data : t));
          toast.success('Task updated!');
        }
      } else {
        // Create new todo
        const response = await api.post('/todos', formData);
        if (response.data?.success) {
          setTodos([response.data.data, ...todos]);
          toast.success('Task added!');
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Submit todo error:', error);
      toast.error('Failed to save task');
    }
  };

  const toggleComplete = async (todo) => {
    try {
      const response = await api.put(`/todos/${todo._id}`, {
        completed: !todo.completed
      });
      
      if (response.data?.success) {
        setTodos(todos.map(t => t._id === todo._id ? response.data.data : t));
        toast.success(todo.completed ? 'Task reopened' : '🎉 Task completed!');
      }
    } catch (error) {
      console.error('Toggle todo error:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTodo = async (id) => {
    if (!confirm('Delete this task?')) return;
    
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Delete todo error:', error);
      toast.error('Failed to delete task');
    }
  };

  const startEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      category: todo.category
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'other'
    });
    setShowAddForm(false);
    setEditingTodo(null);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  const categoryIcons = {
    irrigation: '💧',
    fertilizer: '🌱',
    'pest-control': '🐛',
    harvesting: '🌾',
    planting: '🌿',
    maintenance: '🔧',
    other: '📋'
  };

  const pendingTasks = todos.filter(t => !t.completed).length;
  const completedTasks = todos.filter(t => t.completed).length;

  return (
    <>
      {/* Floating Todo Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-6 z-40 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
        style={{ width: '60px', height: '60px' }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes className="text-2xl" />
            </motion.div>
          ) : (
            <motion.div
              key="tasks"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTasks className="text-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Task Count Badge */}
        {!isOpen && pendingTasks > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
          >
            {pendingTasks}
          </motion.div>
        )}
      </motion.button>

      {/* Todo Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-40 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxWidth: 'calc(100vw - 3rem)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <FaTasks className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Farm Tasks</h3>
                    <p className="text-xs text-blue-100">Manage your daily activities</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition"
                >
                  <FaTimes />
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex space-x-2 text-xs">
                <div className="flex-1 bg-white/20 rounded-lg p-2 text-center">
                  <div className="font-bold text-lg">{pendingTasks}</div>
                  <div className="text-blue-100">Pending</div>
                </div>
                <div className="flex-1 bg-white/20 rounded-lg p-2 text-center">
                  <div className="font-bold text-lg">{completedTasks}</div>
                  <div className="text-blue-100">Completed</div>
                </div>
              </div>
            </div>

            {/* Add Button */}
            {!showAddForm && (
              <div className="p-3 border-b bg-gray-50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <FaPlus />
                  <span>Add New Task</span>
                </motion.button>
              </div>
            )}

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b bg-gray-50 overflow-hidden"
                >
                  <form onSubmit={handleSubmit} className="p-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Task title *"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    
                    <textarea
                      placeholder="Description (optional)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows="2"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                      </select>

                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="irrigation">💧 Irrigation</option>
                        <option value="fertilizer">🌱 Fertilizer</option>
                        <option value="pest-control">🐛 Pest Control</option>
                        <option value="harvesting">🌾 Harvesting</option>
                        <option value="planting">🌿 Planting</option>
                        <option value="maintenance">🔧 Maintenance</option>
                        <option value="other">📋 Other</option>
                      </select>
                    </div>

                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg font-semibold text-sm"
                      >
                        {editingTodo ? 'Update' : 'Add'} Task
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Todo List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 text-sm mt-2">Loading tasks...</p>
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-12">
                  <FaTasks className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tasks yet</p>
                  <p className="text-gray-400 text-sm">Add your first farm task!</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <motion.div
                    key={todo._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`bg-white border-l-4 ${
                      todo.completed ? 'border-green-500 bg-gray-50' : 
                      todo.priority === 'high' ? 'border-red-500' :
                      todo.priority === 'medium' ? 'border-yellow-500' :
                      'border-green-500'
                    } rounded-lg p-3 shadow-sm`}
                  >
                    <div className="flex items-start space-x-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleComplete(todo)}
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          todo.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {todo.completed && <FaCheck className="text-white text-xs" />}
                      </motion.button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {categoryIcons[todo.category]} {todo.title}
                            </h4>
                            {todo.description && (
                              <p className="text-xs text-gray-600 mt-1">{todo.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[todo.priority]}`}>
                                {todo.priority}
                              </span>
                              {todo.dueDate && (
                                <span className="text-xs text-gray-500 flex items-center space-x-1">
                                  <FaCalendar />
                                  <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-1 ml-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEdit(todo)}
                              className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                            >
                              <FaEdit className="text-sm" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteTodo(todo._id)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <FaTrash className="text-sm" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
