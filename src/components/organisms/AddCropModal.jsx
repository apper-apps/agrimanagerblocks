import React, { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import fieldService from "@/services/api/fieldService";

const AddCropModal = ({ isOpen, onClose, onSave, editCrop = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    fieldId: "",
    plantingDate: "",
    estimatedHarvest: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fields, setFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(true);

  useEffect(() => {
    const loadFields = async () => {
      try {
        const fieldsData = await fieldService.getAll();
        setFields(fieldsData.filter(field => field.status === 'active'));
      } catch (error) {
        console.error("Error loading fields:", error);
      } finally {
        setLoadingFields(false);
      }
    };

    if (isOpen) {
      loadFields();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editCrop) {
      const plantingDate = editCrop.plantingDate ? 
        new Date(editCrop.plantingDate).toISOString().split('T')[0] : "";
      const estimatedHarvest = editCrop.estimatedHarvest ? 
        new Date(editCrop.estimatedHarvest).toISOString().split('T')[0] : "";
      
      setFormData({
        name: editCrop.name || "",
        variety: editCrop.variety || "",
        fieldId: editCrop.fieldId?.toString() || "",
        plantingDate,
        estimatedHarvest
      });
    } else {
      setFormData({
        name: "",
        variety: "",
        fieldId: "",
        plantingDate: "",
        estimatedHarvest: ""
      });
    }
    setErrors({});
  }, [editCrop, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Crop name is required";
    }
    
    if (!formData.variety.trim()) {
      newErrors.variety = "Variety is required";
    }
    
    if (!formData.fieldId) {
      newErrors.fieldId = "Field selection is required";
    }
    
    if (!formData.plantingDate) {
      newErrors.plantingDate = "Planting date is required";
    }
    
    if (formData.estimatedHarvest && formData.plantingDate) {
      const plantingDate = new Date(formData.plantingDate);
      const harvestDate = new Date(formData.estimatedHarvest);
      if (harvestDate <= plantingDate) {
        newErrors.estimatedHarvest = "Harvest date must be after planting date";
      }
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
      const selectedField = fields.find(f => f.Id === parseInt(formData.fieldId));
      const cropData = {
        ...formData,
        fieldId: parseInt(formData.fieldId),
        fieldName: selectedField?.name || "",
        plantingDate: new Date(formData.plantingDate).toISOString(),
        estimatedHarvest: formData.estimatedHarvest ? 
          new Date(formData.estimatedHarvest).toISOString() : null,
        status: "planted"
      };
      
      if (editCrop) {
        await onSave(editCrop.Id, cropData);
      } else {
        await onSave(cropData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving crop:", error);
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
            {editCrop ? "Edit Crop" : "Add New Crop"}
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
            label="Crop Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Corn, Soybeans, Wheat"
            required
          />
          
          <FormField
            label="Variety"
            name="variety"
            value={formData.variety}
            onChange={handleChange}
            error={errors.variety}
            placeholder="e.g., Pioneer 1234, Liberty Link"
            required
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Field <span className="text-red-500">*</span>
            </label>
            {loadingFields ? (
              <div className="flex h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 items-center">
                <span className="text-sm text-gray-500">Loading fields...</span>
              </div>
            ) : (
              <select
                name="fieldId"
                value={formData.fieldId}
                onChange={handleChange}
                className={cn(
                  "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-200",
                  errors.fieldId 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
                )}
                required
              >
                <option value="">Select a field</option>
                {fields.map((field) => (
                  <option key={field.Id} value={field.Id}>
                    {field.name} ({field.sizeInAcres} acres)
                  </option>
                ))}
              </select>
            )}
            {errors.fieldId && (
              <p className="text-sm text-red-600">{errors.fieldId}</p>
            )}
          </div>
          
          <FormField
            label="Planting Date"
            name="plantingDate"
            type="date"
            value={formData.plantingDate}
            onChange={handleChange}
            error={errors.plantingDate}
            required
          />
          
          <FormField
            label="Expected Harvest Date"
            name="estimatedHarvest"
            type="date"
            value={formData.estimatedHarvest}
            onChange={handleChange}
            error={errors.estimatedHarvest}
            placeholder="Optional"
          />
          
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
              disabled={isSubmitting || loadingFields}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </div>
              ) : (
                editCrop ? "Update Crop" : "Add Crop"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCropModal;