import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import fertilizerService from "@/services/api/fertilizerService";
import fieldService from "@/services/api/fieldService";
import cropService from "@/services/api/cropService";

const AddFertilizerModal = ({ isOpen, onClose, field, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    fieldId: field?.Id || "",
    cropId: "",
    fertilizerType: "",
    applicationDate: new Date().toISOString().split('T')[0],
    quantityUsed: "",
    unit: "kg",
    costPerUnit: "",
    applicationMethod: "Broadcast",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (field) {
        setFormData(prev => ({ ...prev, fieldId: field.Id }));
      }
    }
  }, [isOpen, field]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [fieldsData, cropsData] = await Promise.all([
        fieldService.getAll(),
        cropService.getAll()
      ]);
      setFields(fieldsData);
      setCrops(cropsData);
    } catch (error) {
      toast.error("Failed to load form data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fieldId) newErrors.fieldId = "Field is required";
    if (!formData.fertilizerType) newErrors.fertilizerType = "Fertilizer type is required";
    if (!formData.applicationDate) newErrors.applicationDate = "Application date is required";
    if (!formData.quantityUsed || formData.quantityUsed <= 0) {
      newErrors.quantityUsed = "Quantity must be greater than 0";
    }
    if (!formData.costPerUnit || formData.costPerUnit <= 0) {
      newErrors.costPerUnit = "Cost per unit must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const fertilizerData = {
        ...formData,
        fieldId: parseInt(formData.fieldId),
        cropId: formData.cropId ? parseInt(formData.cropId) : null,
        quantityUsed: parseFloat(formData.quantityUsed),
        costPerUnit: parseFloat(formData.costPerUnit)
      };

      await fertilizerService.create(fertilizerData);
      toast.success("Fertilizer application recorded successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    } catch (error) {
      toast.error("Failed to record fertilizer application");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fieldId: field?.Id || "",
      cropId: "",
      fertilizerType: "",
      applicationDate: new Date().toISOString().split('T')[0],
      quantityUsed: "",
      unit: "kg",
      costPerUnit: "",
      applicationMethod: "Broadcast",
      notes: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const fieldOptions = fields.map(f => ({ value: f.Id, label: f.name }));
  const cropOptions = [
    { value: "", label: "Select crop (optional)" },
    ...crops.map(c => ({ value: c.Id, label: c.name }))
  ];
  const fertilizerTypes = fertilizerService.getFertilizerTypes().map(type => ({
    value: type,
    label: type
  }));
  const unitOptions = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "lbs", label: "Pounds (lbs)" },
    { value: "tons", label: "Tons" },
    { value: "liters", label: "Liters" }
  ];
  const methodOptions = [
    { value: "Broadcast", label: "Broadcast" },
    { value: "Side-dress", label: "Side-dress" },
    { value: "Foliar", label: "Foliar" },
    { value: "Fertigation", label: "Fertigation" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <ApperIcon name="Zap" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Fertilizer Application</h2>
              <p className="text-sm text-gray-600">Record fertilizer usage for your fields</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>

        {loadingData ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Field"
                name="fieldId"
                type="select"
                options={[{ value: "", label: "Select field" }, ...fieldOptions]}
                value={formData.fieldId}
                onChange={handleInputChange}
                error={errors.fieldId}
                required
              />

              <FormField
                label="Crop"
                name="cropId"
                type="select"
                options={cropOptions}
                value={formData.cropId}
                onChange={handleInputChange}
                error={errors.cropId}
              />
            </div>

            <FormField
              label="Fertilizer Type"
              name="fertilizerType"
              type="select"
              options={[{ value: "", label: "Select fertilizer type" }, ...fertilizerTypes]}
              value={formData.fertilizerType}
              onChange={handleInputChange}
              error={errors.fertilizerType}
              required
            />

            <FormField
              label="Application Date"
              name="applicationDate"
              type="date"
              value={formData.applicationDate}
              onChange={handleInputChange}
              error={errors.applicationDate}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Quantity Used"
                name="quantityUsed"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantityUsed}
                onChange={handleInputChange}
                error={errors.quantityUsed}
                required
              />

              <FormField
                label="Unit"
                name="unit"
                type="select"
                options={unitOptions}
                value={formData.unit}
                onChange={handleInputChange}
              />

              <FormField
                label="Cost per Unit"
                name="costPerUnit"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                error={errors.costPerUnit}
                required
              />
            </div>

            <FormField
              label="Application Method"
              name="applicationMethod"
              type="select"
              options={methodOptions}
              value={formData.applicationMethod}
              onChange={handleInputChange}
            />

            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              placeholder="Optional notes about the application..."
              value={formData.notes}
              onChange={handleInputChange}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Recording..." : "Record Application"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddFertilizerModal;