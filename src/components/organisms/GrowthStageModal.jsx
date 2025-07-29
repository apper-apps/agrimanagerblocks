import React, { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const GROWTH_STAGES = [
  { value: "Planted", label: "Planted", icon: "Seed", color: "bg-earth-100 text-earth-800" },
  { value: "Germinated", label: "Germinated", icon: "Sprout", color: "bg-green-100 text-green-800" },
  { value: "Vegetative", label: "Vegetative", icon: "TreePine", color: "bg-accent-100 text-accent-800" },
  { value: "Flowering", label: "Flowering", icon: "Flower2", color: "bg-purple-100 text-purple-800" },
  { value: "Fruiting", label: "Fruiting", icon: "Apple", color: "bg-orange-100 text-orange-800" },
  { value: "Harvest Ready", label: "Harvest Ready", icon: "ShoppingBasket", color: "bg-yellow-100 text-yellow-800" }
];

const GrowthStageModal = ({ isOpen, onClose, onSave, crop = null }) => {
  const [selectedStage, setSelectedStage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (crop && isOpen) {
      setSelectedStage(crop.growthStage || "Planted");
    }
  }, [crop, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStage || selectedStage === crop?.growthStage) {
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(crop.Id, selectedStage);
    } catch (error) {
      console.error("Error updating growth stage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStageIndex = () => {
    return GROWTH_STAGES.findIndex(stage => stage.value === (crop?.growthStage || "Planted"));
  };

  const getSelectedStageIndex = () => {
    return GROWTH_STAGES.findIndex(stage => stage.value === selectedStage);
  };

  if (!isOpen || !crop) return null;

  const currentStageIndex = getCurrentStageIndex();
  const selectedStageIndex = getSelectedStageIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              Update Growth Stage
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {crop.name} - {crop.variety}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 hover:bg-gray-100"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select the current growth stage:
            </p>
            
            {GROWTH_STAGES.map((stage, index) => {
              const isCurrent = stage.value === crop.growthStage;
              const isSelected = stage.value === selectedStage;
              const isPast = index < currentStageIndex;
              const isFuture = index > currentStageIndex;
              
              return (
                <label
                  key={stage.value}
                  className={cn(
                    "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    isSelected 
                      ? "border-primary-500 bg-primary-50" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    isCurrent && "ring-2 ring-accent-500 ring-opacity-50"
                  )}
                >
                  <input
                    type="radio"
                    name="growthStage"
                    value={stage.value}
                    checked={isSelected}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center flex-1">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full mr-3",
                      stage.color
                    )}>
                      <ApperIcon name={stage.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {stage.label}
                        </span>
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-accent-100 text-accent-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                        {isPast && (
                          <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </div>
                      {isFuture && (
                        <p className="text-xs text-gray-500 mt-1">
                          Future stage
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <ApperIcon name="Check" className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {crop.stageHistory && crop.stageHistory.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Stage History</h4>
              <div className="space-y-2">
                {crop.stageHistory.slice(-3).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600">
                    <ApperIcon name="Clock" className="w-3 h-3 mr-2" />
                    <span className="font-medium">{entry.stage}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
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
              disabled={isSubmitting || selectedStage === crop.growthStage}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                selectedStage === crop.growthStage ? "No Change" : "Update Stage"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrowthStageModal;