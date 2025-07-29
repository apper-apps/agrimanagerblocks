import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import irrigationService from '@/services/api/irrigationService';

const AddIrrigationModal = ({ isOpen, onClose, field, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '',
    waterAmount: '',
    irrigationMethod: 'sprinkler',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const irrigationMethods = [
    { value: 'sprinkler', label: 'Sprinkler System' },
    { value: 'drip', label: 'Drip Irrigation' },
    { value: 'flood', label: 'Flood Irrigation' },
    { value: 'manual', label: 'Manual Watering' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0 minutes';
    }

    if (!formData.waterAmount || formData.waterAmount <= 0) {
      newErrors.waterAmount = 'Water amount must be greater than 0 gallons';
    }

    if (!formData.irrigationMethod) {
      newErrors.irrigationMethod = 'Irrigation method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      const irrigationData = {
        fieldId: field.Id,
        date: new Date(formData.date).toISOString(),
        duration: parseInt(formData.duration),
        waterAmount: parseInt(formData.waterAmount),
        irrigationMethod: formData.irrigationMethod,
        notes: formData.notes.trim()
      };

      await irrigationService.create(irrigationData);
      
      toast.success(`Irrigation record added for ${field.name}`);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        duration: '',
        waterAmount: '',
        irrigationMethod: 'sprinkler',
        notes: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding irrigation record:', error);
      toast.error('Failed to add irrigation record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        duration: '',
        waterAmount: '',
        irrigationMethod: 'sprinkler',
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add Irrigation Record</h3>
            <p className="text-sm text-gray-500 mt-1">Log watering activity for {field?.name}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            error={errors.date}
            required
          />

          <FormField
            label="Duration (minutes)"
            name="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={handleInputChange}
            error={errors.duration}
            placeholder="e.g., 120"
            required
          />

          <FormField
            label="Water Amount (gallons)"
            name="waterAmount"
            type="number"
            min="1"
            value={formData.waterAmount}
            onChange={handleInputChange}
            error={errors.waterAmount}
            placeholder="e.g., 850"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Irrigation Method *
            </label>
            <select
              name="irrigationMethod"
              value={formData.irrigationMethod}
              onChange={handleInputChange}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                errors.irrigationMethod && "border-red-500 focus:ring-red-500 focus:border-red-500"
              )}
              required
            >
              {irrigationMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            {errors.irrigationMethod && (
              <p className="text-sm text-red-600">{errors.irrigationMethod}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Additional notes about the irrigation..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Record'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIrrigationModal;