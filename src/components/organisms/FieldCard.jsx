import React, { useEffect, useState } from "react";
import AddIrrigationModal from "@/components/organisms/AddIrrigationModal";
import IrrigationHistoryModal from "@/components/organisms/IrrigationHistoryModal";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Crops from "@/components/pages/Crops";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";
const FieldCard = ({ field, onEdit, onDelete, className }) => {
const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [showAddIrrigation, setShowAddIrrigation] = useState(false);
  const [showIrrigationHistory, setShowIrrigationHistory] = useState(false);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const loadFieldCrops = async () => {
    try {
      setLoadingCrops(true);
      const cropService = (await import('@/services/api/cropService')).default;
      const allCrops = await cropService.getAll();
      const fieldCrops = allCrops.filter(crop => crop.fieldId === field.Id);
      setCrops(fieldCrops);
    } catch (error) {
      console.error('Error loading field crops:', error);
      setCrops([]);
    } finally {
      setLoadingCrops(false);
    }
  };

  useEffect(() => {
    loadFieldCrops();
  }, [field.Id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'planted':
        return 'bg-blue-100 text-blue-800';
      case 'growing':
        return 'bg-green-100 text-green-800';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'harvested':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

const getFieldStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "fallow":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className={cn("field-card", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mr-3">
            <ApperIcon name="MapPin" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-display">
              {field.name}
            </h3>
            <p className="text-sm text-gray-600">{field.location}</p>
          </div>
        </div>
<span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium capitalize",
          getFieldStatusColor(field.status)
        )}>
          {field.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Maximize" className="w-4 h-4 mr-2 text-primary-500" />
          <span>{field.sizeInAcres} acres</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-primary-500" />
          <span>Added {formatDate(field.createdAt)}</span>
        </div>
      </div>
{/* Assigned Crops Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            Assigned Crops ({crops.length})
          </h4>
          <ApperIcon name="Wheat" className="w-4 h-4 text-primary-500" />
        </div>
        
        {loadingCrops ? (
          <div className="text-sm text-gray-500">Loading crops...</div>
        ) : crops.length > 0 ? (
          <div className="space-y-2">
            {crops.slice(0, 2).map((crop) => (
              <div key={crop.Id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {crop.name}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      getStatusColor(crop.status)
                    )}>
                      {crop.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {crop.variety} • Planted {formatDate(crop.plantingDate)}
                  </div>
                </div>
              </div>
            ))}
            {crops.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{crops.length - 2} more crops
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No crops assigned to this field
          </div>
        )}
      </div>

<div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddIrrigation(true)}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <ApperIcon name="Droplets" size={16} className="mr-1" />
          Add Irrigation
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowIrrigationHistory(true)}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <ApperIcon name="History" size={16} className="mr-1" />
          View History
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit && onEdit(field)}
          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
        >
          <ApperIcon name="Edit2" className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete && onDelete(field.Id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ApperIcon name="Trash2" className="w-4 h-4 mr-1" />
          Delete
        </Button>
</div>

      <AddIrrigationModal
        isOpen={showAddIrrigation}
        onClose={() => setShowAddIrrigation(false)}
        field={field}
        onSuccess={() => {
          // Could refresh field data here if needed
        }}
      />

      <IrrigationHistoryModal
        isOpen={showIrrigationHistory}
        onClose={() => setShowIrrigationHistory(false)}
        field={field}
      />
    </div>
  );
};

export default FieldCard;