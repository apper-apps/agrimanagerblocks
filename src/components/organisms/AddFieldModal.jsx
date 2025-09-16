import React, { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";

const AddFieldModal = ({ isOpen, onClose, onSave, editField = null }) => {
const [formData, setFormData] = useState({
    name: "",
    sizeInAcres: "",
    location: "",
    status: "active",
    type: "crop"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
    if (editField) {
setFormData({
        name: editField?.name_c || editField?.name || '',
        sizeInAcres: editField?.size_in_acres_c?.toString() || editField?.sizeInAcres?.toString() || '',
        location: editField?.location_c || editField?.location || '',
        status: editField?.status_c || editField?.status || '',
        type: editField?.type || "crop"
      });
    } else {
      setFormData({
name: "",
        sizeInAcres: "",
        location: "",
        status: "active",
        type: "crop"
      });
    }
    setErrors({});
  }, [editField, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Field name is required";
    }
    
    if (!formData.sizeInAcres || parseFloat(formData.sizeInAcres) <= 0) {
      newErrors.sizeInAcres = "Size must be a positive number";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const fieldData = {
        ...formData,
        sizeInAcres: parseFloat(formData.sizeInAcres)
      };
      
      if (editField) {
        await onSave(editField.Id, fieldData);
      } else {
        await onSave(fieldData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving field:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 font-display">
            {editField ? "Edit Field" : "Add New Field"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-gray-100"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Field Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., North Field, Corn Field A"
            required
          />
          
          <FormField
            label="Size (acres)"
            name="sizeInAcres"
            type="number"
            value={formData.sizeInAcres}
            onChange={handleChange}
            error={errors.sizeInAcres}
            placeholder="e.g., 25.5"
            step="0.1"
            min="0"
            required
          />
          
          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            placeholder="e.g., North Pasture, Section 4"
            required
/>
          
          <FormField
            label="Field Type"
            type="select"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={[
              { value: "crop", label: "Crop Field" },
              { value: "pasture", label: "Pasture" },
              { value: "orchard", label: "Orchard" },
              { value: "greenhouse", label: "Greenhouse" },
              { value: "storage", label: "Storage Area" },
              { value: "other", label: "Other" }
            ]}
            error={errors.type}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            >
              <option value="active">Active</option>
              <option value="fallow">Fallow</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </div>
              ) : (
                editField ? "Update Field" : "Add Field"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFieldModal;