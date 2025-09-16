import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import equipmentService from '@/services/api/equipmentService';
import fieldService from '@/services/api/fieldService';
const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  // Fetch equipment data
const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await equipmentService.getAll();
      setEquipment(data);
    } catch (error) {
      console.error("Error fetching equipment:", error?.response?.data?.message || error.message);
      setError(error?.response?.data?.message || "Failed to load equipment data");
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch fields for lookup
const fetchFields = async () => {
    try {
      const data = await fieldService.getAll();
      setFields(data);
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };

  // Create equipment
const createEquipment = async (equipmentData) => {
    try {
      setSubmitting(true);
      
      await equipmentService.create(equipmentData);
      toast.success('Equipment created successfully');
      fetchEquipment();
      setIsAddModalOpen(false);
      return true;
    } catch (error) {
      console.error("Error creating equipment:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to create equipment");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Update equipment
const updateEquipment = async (id, equipmentData) => {
    try {
      setSubmitting(true);
      
      await equipmentService.update(id, equipmentData);
      toast.success('Equipment updated successfully');
      fetchEquipment();
      setIsEditModalOpen(false);
      setSelectedEquipment(null);
      return true;
    } catch (error) {
      console.error("Error updating equipment:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to update equipment");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

// Delete equipment
  const deleteEquipment = async (id) => {
    if (!confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      return;
    }

    try {
      await equipmentService.delete(id);
      toast.success('Equipment deleted successfully');
      fetchEquipment();
      return true;
    } catch (error) {
      console.error("Error deleting equipment:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to delete equipment");
      return false;
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchFields();
  }, []);

  // Filter equipment based on search and status
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name_c?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type_c?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.operational_status_c === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={fetchEquipment} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600">Manage and track your agricultural equipment</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={20} />
          Add Equipment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="operational">Operational</option>
          <option value="inactive">Inactive</option>
          <option value="under maintenance">Under Maintenance</option>
        </select>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <Empty 
          message={searchTerm || statusFilter !== 'all' ? "No equipment found matching your criteria" : "No equipment added yet"} 
          action={
            <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
              Add First Equipment
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item.Id}
              equipment={item}
              fields={fields}
              onEdit={(equipment) => {
                setSelectedEquipment(equipment);
                setIsEditModalOpen(true);
              }}
              onDelete={(id) => deleteEquipment(id)}
            />
          ))}
        </div>
      )}

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <EquipmentModal
          fields={fields}
          onSubmit={createEquipment}
          onClose={() => setIsAddModalOpen(false)}
          submitting={submitting}
          title="Add New Equipment"
        />
      )}

      {/* Edit Equipment Modal */}
      {isEditModalOpen && selectedEquipment && (
        <EquipmentModal
          fields={fields}
          equipment={selectedEquipment}
          onSubmit={(data) => updateEquipment(selectedEquipment.Id, data)}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEquipment(null);
          }}
          submitting={submitting}
          title="Edit Equipment"
        />
      )}
    </div>
  );
};

// Equipment Card Component
const EquipmentCard = ({ equipment, fields, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'under maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldName = (fieldId) => {
    if (!fieldId) return 'N/A';
    if (typeof fieldId === 'object' && fieldId.Name) return fieldId.Name;
    const field = fields.find(f => f.Id === fieldId);
    return field?.name_c || field?.Name || 'Unknown Field';
  };

  return (
    <div className="field-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <ApperIcon name="Truck" size={24} className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{equipment.name_c || equipment.Name}</h3>
            <p className="text-sm text-gray-600">{equipment.type_c}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(equipment)}
            className="p-2"
          >
            <ApperIcon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(equipment.Id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash" size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.operational_status_c)}`}>
            {equipment.operational_status_c?.replace('_', ' ')?.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Field</span>
          <span className="text-sm font-medium text-gray-900">{getFieldName(equipment.field_c)}</span>
        </div>

        {equipment.purchase_date_c && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Purchase Date</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(equipment.purchase_date_c).toLocaleDateString()}
            </span>
          </div>
        )}

        {equipment.maintenance_schedule_c && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Maintenance</span>
            <span className="text-sm font-medium text-gray-900">{equipment.maintenance_schedule_c}</span>
          </div>
        )}

        {equipment.description_c && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">{equipment.description_c}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Equipment Modal Component
const EquipmentModal = ({ fields, equipment, onSubmit, onClose, submitting, title }) => {
  const [formData, setFormData] = useState({
    name_c: equipment?.name_c || '',
    type_c: equipment?.type_c || '',
    purchase_date_c: equipment?.purchase_date_c ? equipment.purchase_date_c.split('T')[0] : '',
    maintenance_schedule_c: equipment?.maintenance_schedule_c || '',
    operational_status_c: equipment?.operational_status_c || 'operational',
    field_c: equipment?.field_c?.Id || equipment?.field_c || '',
    notes_c: equipment?.notes_c || '',
    description_c: equipment?.description_c || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name_c.trim()) {
      toast.error('Equipment name is required');
      return;
    }
    
    if (!formData.type_c.trim()) {
      toast.error('Equipment type is required');
      return;
    }

    const success = await onSubmit(formData);
    if (success && !equipment) {
      setFormData({
        name_c: '',
        type_c: '',
        purchase_date_c: '',
        maintenance_schedule_c: '',
        operational_status_c: 'operational',
        field_c: '',
        notes_c: '',
        description_c: ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name *
              </label>
              <Input
                name="name_c"
                value={formData.name_c}
                onChange={handleChange}
                placeholder="Enter equipment name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <Input
                name="type_c"
                value={formData.type_c}
                onChange={handleChange}
                placeholder="e.g., Tractor, Harvester, Plow"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date
              </label>
              <Input
                type="date"
                name="purchase_date_c"
                value={formData.purchase_date_c}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operational Status
              </label>
              <select
                name="operational_status_c"
                value={formData.operational_status_c}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="operational">Operational</option>
                <option value="inactive">Inactive</option>
                <option value="under maintenance">Under Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Field
              </label>
              <select
                name="field_c"
                value={formData.field_c}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Field</option>
                {fields.map((field) => (
                  <option key={field.Id} value={field.Id}>
                    {field.name_c || field.Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Schedule
              </label>
              <Input
                name="maintenance_schedule_c"
                value={formData.maintenance_schedule_c}
                onChange={handleChange}
                placeholder="e.g., Weekly, Monthly, Every 100 hours"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description_c"
              value={formData.description_c}
              onChange={handleChange}
              placeholder="Enter equipment description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes_c"
              value={formData.notes_c}
              onChange={handleChange}
              placeholder="Additional notes about the equipment"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {submitting && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
              {submitting ? 'Saving...' : (equipment ? 'Update Equipment' : 'Add Equipment')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Equipment;