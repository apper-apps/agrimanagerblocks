import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import pestMonitoringService from "@/services/api/pestMonitoringService";
import fieldService from "@/services/api/fieldService";
import cropService from "@/services/api/cropService";

const AddPestObservationModal = ({ isOpen, onClose, field, observation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [pestTypes, setPestTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);

  const [formData, setFormData] = useState({
    fieldId: field?.Id || '',
    cropId: '',
    pestType: '',
    category: '',
    severityLevel: 1,
    affectedArea: '',
    affectedAreaUnit: 'acres',
    observationDate: new Date().toISOString().split('T')[0],
    description: '',
    treatmentApplied: '',
    treatmentDate: '',
    treatmentCost: '',
    status: 'Active',
    weatherConditions: '',
    observedBy: 'Farm Manager',
    followUpRequired: false,
    followUpDate: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (observation) {
      setFormData({
        fieldId: observation.fieldId || '',
        cropId: observation.cropId || '',
        pestType: observation.pestType || '',
        category: observation.category || '',
        severityLevel: observation.severityLevel || 1,
        affectedArea: observation.affectedArea || '',
        affectedAreaUnit: observation.affectedAreaUnit || 'acres',
        observationDate: observation.observationDate ? observation.observationDate.split('T')[0] : new Date().toISOString().split('T')[0],
        description: observation.description || '',
        treatmentApplied: observation.treatmentApplied || '',
        treatmentDate: observation.treatmentDate ? observation.treatmentDate.split('T')[0] : '',
        treatmentCost: observation.treatmentCost || '',
        status: observation.status || 'Active',
        weatherConditions: observation.weatherConditions || '',
        observedBy: observation.observedBy || 'Farm Manager',
        followUpRequired: observation.followUpRequired || false,
        followUpDate: observation.followUpDate ? observation.followUpDate.split('T')[0] : '',
        notes: observation.notes || ''
      });
      setPhotos(observation.photos || []);
    } else {
      // Reset form for new observation
      setFormData(prev => ({
        ...prev,
        fieldId: field?.Id || '',
        cropId: '',
        pestType: '',
        category: '',
        severityLevel: 1,
        affectedArea: '',
        treatmentApplied: '',
        treatmentDate: '',
        treatmentCost: '',
        status: 'Active',
        description: '',
        weatherConditions: '',
        followUpRequired: false,
        followUpDate: '',
        notes: ''
      }));
      setPhotos([]);
    }
  }, [observation, field]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const [fieldsData, cropsData, pestTypesData] = await Promise.all([
        fieldService.getAll(),
        cropService.getAll(),
        pestMonitoringService.getPestTypes()
      ]);
      setFields(fieldsData);
      setCrops(cropsData);
      setPestTypes(pestTypesData);
    } catch (err) {
      toast.error("Failed to load form data");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now(),
          name: file.name,
          data: e.target.result,
          size: file.size
        };
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fieldId) newErrors.fieldId = "Field is required";
    if (!formData.pestType) newErrors.pestType = "Pest/disease type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.affectedArea) newErrors.affectedArea = "Affected area is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (formData.followUpRequired && !formData.followUpDate) {
      newErrors.followUpDate = "Follow-up date is required when follow-up is needed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const observationData = {
        ...formData,
        photos: photos,
        observationDate: new Date(formData.observationDate).toISOString(),
        treatmentDate: formData.treatmentDate ? new Date(formData.treatmentDate).toISOString() : null,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null
      };

      if (observation) {
        await pestMonitoringService.update(observation.Id, observationData);
        toast.success("Observation updated successfully");
      } else {
        await pestMonitoringService.create(observationData);
        toast.success("Observation added successfully");
      }
      
      onSuccess && onSuccess();
    } catch (err) {
      toast.error(observation ? "Failed to update observation" : "Failed to add observation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fieldId: field?.Id || '',
      cropId: '',
      pestType: '',
      category: '',
      severityLevel: 1,
      affectedArea: '',
      affectedAreaUnit: 'acres',
      observationDate: new Date().toISOString().split('T')[0],
      description: '',
      treatmentApplied: '',
      treatmentDate: '',
      treatmentCost: '',
      status: 'Active',
      weatherConditions: '',
      observedBy: 'Farm Manager',
      followUpRequired: false,
      followUpDate: '',
      notes: ''
    });
    setPhotos([]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const fieldOptions = fields.map(field => ({
    value: field.Id,
    label: field.name
  }));

  const cropOptions = [
    { value: "", label: "Select crop (optional)" },
    ...crops.map(crop => ({
      value: crop.Id,
      label: crop.name
    }))
  ];

  const severityOptions = [
    { value: 1, label: "1 - Very Low" },
    { value: 2, label: "2 - Low" },
    { value: 3, label: "3 - Moderate" },
    { value: 4, label: "4 - High" },
    { value: 5, label: "5 - Very High" }
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Monitoring", label: "Monitoring" },
    { value: "Resolved", label: "Resolved" }
  ];

  const areaUnitOptions = [
    { value: "acres", label: "Acres" },
    { value: "hectares", label: "Hectares" },
    { value: "sq ft", label: "Square Feet" },
    { value: "sq m", label: "Square Meters" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {observation ? 'Edit Observation' : 'Add Pest/Disease Observation'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {initialLoading ? (
            <div className="p-8">
              <Loading message="Loading form data..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field*</label>
                  <select
                    name="fieldId"
                    value={formData.fieldId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select field</option>
                    {fieldOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.fieldId && <p className="text-red-500 text-sm mt-1">{errors.fieldId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
                  <select
                    name="cropId"
                    value={formData.cropId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {cropOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pest/Disease Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {pestTypes.map(category => (
                      <option key={category.category} value={category.category}>{category.category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type*</label>
                  <select
                    name="pestType"
                    value={formData.pestType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={!formData.category}
                  >
                    <option value="">Select type</option>
                    {formData.category && pestTypes.find(cat => cat.category === formData.category)?.types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.pestType && <p className="text-red-500 text-sm mt-1">{errors.pestType}</p>}
                </div>
              </div>

              {/* Severity and Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level*</label>
                  <select
                    name="severityLevel"
                    value={formData.severityLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {severityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <FormField
                    label="Affected Area*"
                    name="affectedArea"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.affectedArea}
                    onChange={handleInputChange}
                    error={errors.affectedArea}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    name="affectedAreaUnit"
                    value={formData.affectedAreaUnit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {areaUnitOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates and Observer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    label="Observation Date*"
                    name="observationDate"
                    type="date"
                    value={formData.observationDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <FormField
                    label="Observed By"
                    name="observedBy"
                    value={formData.observedBy}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe the observation in detail..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Weather Conditions */}
              <div>
                <FormField
                  label="Weather Conditions"
                  name="weatherConditions"
                  value={formData.weatherConditions}
                  onChange={handleInputChange}
                  placeholder="e.g., Warm and humid, 78°F"
                />
              </div>

              {/* Treatment Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Treatment Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormField
                      label="Treatment Applied"
                      name="treatmentApplied"
                      value={formData.treatmentApplied}
                      onChange={handleInputChange}
                      placeholder="e.g., Insecticidal soap spray"
                    />
                  </div>

                  <div>
                    <FormField
                      label="Treatment Date"
                      name="treatmentDate"
                      type="date"
                      value={formData.treatmentDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormField
                      label="Treatment Cost"
                      name="treatmentCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.treatmentCost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    checked={formData.followUpRequired}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Follow-up Required</label>
                </div>

                {formData.followUpRequired && (
                  <div>
                    <FormField
                      label="Follow-up Date"
                      name="followUpDate"
                      type="date"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                      error={errors.followUpDate}
                    />
                  </div>
                )}
              </div>

              {/* Photos */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Photos</h3>
                
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <ApperIcon name="Camera" className="w-4 h-4 mr-2" />
                    Upload Photos
                  </label>
                  <p className="text-sm text-gray-500 mt-1">Maximum 5MB per file</p>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.data}
                          alt={photo.name}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <ApperIcon name="X" className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any additional notes or observations..."
                />
              </div>
            </form>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || initialLoading}>
            {loading ? <Loading /> : (observation ? 'Update Observation' : 'Add Observation')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPestObservationModal;