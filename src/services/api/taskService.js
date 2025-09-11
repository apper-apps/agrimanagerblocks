import mockTasks from '@/services/mockData/tasks.json';
import { toast } from 'react-toastify';

class TaskService {
  constructor() {
    this.tasks = [...mockTasks];
    this.nextId = Math.max(...this.tasks.map(t => t.Id)) + 1;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    try {
      await this.delay(300);
      return [...this.tasks];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      await this.delay(200);
      const task = this.tasks.find(t => t.Id === parseInt(id));
      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }
      return { ...task };
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(taskData) {
    try {
      await this.delay(400);
      const newTask = {
        Id: this.nextId++,
        Name: taskData.Name || '',
        description_c: taskData.description_c || '',
        status_c: taskData.status_c || 'Pending',
        priority_c: taskData.priority_c || 'Medium',
        assigned_to_c: taskData.assigned_to_c || '',
        due_date_c: taskData.due_date_c || null,
        field_id_c: taskData.field_id_c || null,
        crop_id_c: taskData.crop_id_c || null,
        estimated_hours_c: taskData.estimated_hours_c || 0,
        actual_hours_c: taskData.actual_hours_c || 0,
        notes_c: taskData.notes_c || '',
        Tags: taskData.Tags || '',
        CreatedOn: new Date().toISOString(),
        ModifiedOn: new Date().toISOString()
      };
      
      this.tasks.push(newTask);
      toast.success('Task created successfully');
      return { ...newTask };
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      toast.error('Failed to create task');
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      await this.delay(400);
      const taskIndex = this.tasks.findIndex(t => t.Id === parseInt(id));
      if (taskIndex === -1) {
        throw new Error(`Task with ID ${id} not found`);
      }

      const updatedTask = {
        ...this.tasks[taskIndex],
        ...taskData,
        Id: parseInt(id),
        ModifiedOn: new Date().toISOString()
      };

      this.tasks[taskIndex] = updatedTask;
      toast.success('Task updated successfully');
      return { ...updatedTask };
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error?.response?.data?.message || error);
      toast.error('Failed to update task');
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.delay(300);
      const taskIndex = this.tasks.findIndex(t => t.Id === parseInt(id));
      if (taskIndex === -1) {
        throw new Error(`Task with ID ${id} not found`);
      }

      this.tasks.splice(taskIndex, 1);
      toast.success('Task deleted successfully');
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error?.response?.data?.message || error);
      toast.error('Failed to delete task');
      throw error;
    }
  }

  async getTasksByField(fieldId) {
    try {
      await this.delay(250);
      return this.tasks.filter(t => t.field_id_c === parseInt(fieldId));
    } catch (error) {
      console.error(`Error fetching tasks for field ${fieldId}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async getTasksByCrop(cropId) {
    try {
      await this.delay(250);
      return this.tasks.filter(t => t.crop_id_c === parseInt(cropId));
    } catch (error) {
      console.error(`Error fetching tasks for crop ${cropId}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async getTasksByStatus(status) {
    try {
      await this.delay(250);
      return this.tasks.filter(t => t.status_c === status);
    } catch (error) {
      console.error(`Error fetching tasks with status ${status}:`, error?.response?.data?.message || error);
      throw error;
    }
  }
}

export default new TaskService();