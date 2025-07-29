import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import plantingRecordService from "@/services/api/plantingRecordService";
import cropService from "@/services/api/cropService";
import fieldService from "@/services/api/fieldService";

const AddPlantingRecordModal = ({ isOpen, onClose, onSuccess, record = null }) => {
  const [formData, setFormData] = useState({
    cropId: "",
    fieldId: "",
    plantingDate: "",
    seedQuantity: "",
    plantingMethod: "Direct Seeding",
    notes: ""
  });
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!record;

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      if (record) {
        setFormData({
          cropId: record.cropId.toString(),
          fieldId: record.fieldId.toString(),
          plantingDate: record.plantingDate,
          seedQuantity: record.seedQuantity.toString(),
          plantingMethod: record.plantingMethod,
          notes: record.notes || ""
        });
      } else {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, plantingDate: today }));
      }
    }
  }, [isOpen, record]);

  const loadDropdownData = async () => {
    try {
      const [cropsData, fieldsData] = await Promise.all([
        cropService.getAll(),
        fieldService.getAll()
      ]);
      setCrops(cropsData);
      setFields(fieldsData);
    } catch (err) {
      toast.error("Failed to load form data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cropId) newErrors.cropId = "Crop is required";
    if (!formData.fieldId) newErrors.fieldId = "Field is required";
    if (!formData.plantingDate) newErrors.plantingDate = "Planting date is required";
    if (!formData.seedQuantity) {
      newErrors.seedQuantity = "Seed quantity is required";
    } else if (parseFloat(formData.seedQuantity) <= 0) {
      newErrors.seedQuantity = "Seed quantity must be greater than 0";
    }
    if (!formData.plantingMethod) newErrors.plantingMethod = "Planting method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await plantingRecordService.update(record.Id, formData);
        toast.success("Planting record updated successfully");
      } else {
        await plantingRecordService.create(formData);
        toast.success("Planting record created successfully");
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditing ? 'update' : 'create'} planting record`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      cropId: "",
      fieldId: "",
      plantingDate: "",
      seedQuantity: "",
      plantingMethod: "Direct Seeding",
      notes: ""
    });
    setErrors({});
    onClose();
  };

  const plantingMethods = plantingRecordService.getPlantingMethods();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 font-display">
            {isEditing ? "Edit Planting Record" : "Add Planting Record"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          <FormField
            label="Crop"
            name="cropId"
            type="select"
            value={formData.cropId}
            onChange={handleInputChange}
            error={errors.cropId}
            required
            options={[
              { value: "", label: "Select a crop..." },
              ...crops.map(crop => ({ value: crop.Id.toString(), label: crop.name }))
            ]}
          />

          <FormField
            label="Field"
            name="fieldId"
            type="select"
            value={formData.fieldId}
            onChange={handleInputChange}
            error={errors.fieldId}
            required
            options={[
              { value: "", label: "Select a field..." },
              ...fields.map(field => ({ value: field.Id.toString(), label: field.name }))
            ]}
          />

          <FormField
            label="Planting Date"
            name="plantingDate"
            type="date"
            value={formData.plantingDate}
            onChange={handleInputChange}
            error={errors.plantingDate}
            required
          />

          <FormField
            label="Seed Quantity"
            name="seedQuantity"
            type="number"
            value={formData.seedQuantity}
            onChange={handleInputChange}
            error={errors.seedQuantity}
            placeholder="Enter quantity used"
            min="0"
            step="0.1"
            required
          />

          <FormField
            label="Planting Method"
            name="plantingMethod"
            type="select"
            value={formData.plantingMethod}
            onChange={handleInputChange}
            error={errors.plantingMethod}
            required
            options={plantingMethods.map(method => ({ value: method, label: method }))}
          />

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleInputChange}
            error={errors.notes}
            placeholder="Optional notes about this planting..."
            rows={3}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </div>
              ) : (
                isEditing ? "Update Record" : "Create Record"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlantingRecordModal;