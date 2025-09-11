import React, { useState, useEffect } from 'react';
import taskService from '@/services/api/taskService';
import fieldService from '@/services/api/fieldService';
import cropService from '@/services/api/cropService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { toast } from 'react-toastify';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    fieldId: '',
    cropId: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    Name: '',
    description_c: '',
    status_c: 'Pending',
    priority_c: 'Medium',
    assigned_to_c: '',
    due_date_c: '',
    field_id_c: '',
    crop_id_c: '',
    estimated_hours_c: '',
    notes_c: '',
    Tags: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, fieldsData, cropsData] = await Promise.all([
        taskService.getAll(),
        fieldService.getAll(),
        cropService.getAll()
      ]);
      setTasks(tasksData);
      setFields(fieldsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading task data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const newTask = await taskService.create(formData);
      setTasks([...tasks, newTask]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const updatedTask = await taskService.update(editingTask.Id, formData);
      setTasks(tasks.map(task => 
        task.Id === editingTask.Id ? updatedTask : task
      ));
      setIsModalOpen(false);
      setEditingTask(null);
      resetForm();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(taskId);
        setTasks(tasks.filter(task => task.Id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      description_c: '',
      status_c: 'Pending',
      priority_c: 'Medium',
      assigned_to_c: '',
      due_date_c: '',
      field_id_c: '',
      crop_id_c: '',
      estimated_hours_c: '',
      notes_c: '',
      Tags: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setFormData({
      Name: task.Name || '',
      description_c: task.description_c || '',
      status_c: task.status_c || 'Pending',
      priority_c: task.priority_c || 'Medium',
      assigned_to_c: task.assigned_to_c || '',
      due_date_c: task.due_date_c ? task.due_date_c.split('T')[0] : '',
      field_id_c: task.field_id_c || '',
      crop_id_c: task.crop_id_c || '',
      estimated_hours_c: task.estimated_hours_c || '',
      notes_c: task.notes_c || '',
      Tags: task.Tags || ''
    });
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldName = (fieldId) => {
    const field = fields.find(f => f.Id === fieldId);
    return field?.Name || 'No Field';
  };

  const getCropName = (cropId) => {
    const crop = crops.find(c => c.Id === cropId);
    return crop?.Name || 'No Crop';
  };

  const filteredTasks = tasks.filter(task => {
    return (
      (!filters.status || task.status_c === filters.status) &&
      (!filters.priority || task.priority_c === filters.priority) &&
      (!filters.fieldId || task.field_id_c === parseInt(filters.fieldId)) &&
      (!filters.cropId || task.crop_id_c === parseInt(filters.cropId))
    );
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Task Management</h1>
          <p className="text-gray-600 mt-1">Manage and track your farm tasks</p>
        </div>
        <Button onClick={openCreateModal} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="statusFilter">Status</Label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <Label htmlFor="priorityFilter">Priority</Label>
            <select
              id="priorityFilter"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <Label htmlFor="fieldFilter">Field</Label>
            <select
              id="fieldFilter"
              value={filters.fieldId}
              onChange={(e) => setFilters({...filters, fieldId: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Fields</option>
              {fields.map(field => (
                <option key={field.Id} value={field.Id}>{field.Name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="cropFilter">Crop</Label>
            <select
              id="cropFilter"
              value={filters.cropId}
              onChange={(e) => setFilters({...filters, cropId: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Crops</option>
              {crops.map(crop => (
                <option key={crop.Id} value={crop.Id}>{crop.Name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTasks.length === 0 ? (
          <Empty
            icon="CheckSquare"
            title="No tasks found"
            description="Create your first task to get started with task management."
            actionLabel="Add Task"
            onAction={openCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field/Crop
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.Name}</div>
                        <div className="text-sm text-gray-500">{task.description_c}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status_c)}`}>
                        {task.status_c}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority_c)}`}>
                        {task.priority_c}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.assigned_to_c || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.due_date_c ? new Date(task.due_date_c).toLocaleDateString() : 'No due date'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getFieldName(task.field_id_c)}</div>
                      <div className="text-sm text-gray-500">{getCropName(task.crop_id_c)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <ApperIcon name="Edit" size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.Id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input
                    id="taskName"
                    value={formData.Name}
                    onChange={(e) => setFormData({...formData, Name: e.target.value})}
                    placeholder="Enter task name"
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assigned_to_c}
                    onChange={(e) => setFormData({...formData, assigned_to_c: e.target.value})}
                    placeholder="Enter assignee name"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status_c}
                    onChange={(e) => setFormData({...formData, status_c: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority_c}
                    onChange={(e) => setFormData({...formData, priority_c: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="field">Field</Label>
                  <select
                    id="field"
                    value={formData.field_id_c}
                    onChange={(e) => setFormData({...formData, field_id_c: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Field</option>
                    {fields.map(field => (
                      <option key={field.Id} value={field.Id}>{field.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="crop">Crop</Label>
                  <select
                    id="crop"
                    value={formData.crop_id_c}
                    onChange={(e) => setFormData({...formData, crop_id_c: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Crop</option>
                    {crops.map(crop => (
                      <option key={crop.Id} value={crop.Id}>{crop.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.due_date_c}
                    onChange={(e) => setFormData({...formData, due_date_c: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={formData.estimated_hours_c}
                    onChange={(e) => setFormData({...formData, estimated_hours_c: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description_c}
                    onChange={(e) => setFormData({...formData, description_c: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.Tags}
                    onChange={(e) => setFormData({...formData, Tags: e.target.value})}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={formData.notes_c}
                    onChange={(e) => setFormData({...formData, notes_c: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={editingTask ? handleUpdateTask : handleCreateTask}
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;