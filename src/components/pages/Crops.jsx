import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import CropRow from "@/components/organisms/CropRow";
import AddCropModal from "@/components/organisms/AddCropModal";
import GrowthStageModal from "@/components/organisms/GrowthStageModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import cropService from "@/services/api/cropService";
const Crops = () => {
const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageUpdateCrop, setStageUpdateCrop] = useState(null);
  const loadCrops = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await cropService.getAll();
      setCrops(data);
    } catch (err) {
      setError("Failed to load crops. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setShowAddModal(true);
  };

  const handleAddCrop = async (cropData) => {
    try {
      const newCrop = await cropService.create(cropData);
      setCrops(prev => [...prev, newCrop]);
      toast.success("Crop added successfully!");
    } catch (error) {
      toast.error("Failed to add crop. Please try again.");
      console.error("Error adding crop:", error);
    }
  };

const handleUpdateCrop = async (id, cropData) => {
    try {
      const updatedCrop = await cropService.update(id, cropData);
      setCrops(prev => prev.map(crop => 
        crop.Id === id ? updatedCrop : crop
      ));
      toast.success("Crop updated successfully!");
    } catch (error) {
      toast.error("Failed to update crop. Please try again.");
      console.error("Error updating crop:", error);
    }
  };

  const handleStageUpdate = (crop) => {
    setStageUpdateCrop(crop);
    setShowStageModal(true);
  };

  const handleUpdateGrowthStage = async (cropId, newStage) => {
    try {
      const updatedCrop = await cropService.update(cropId, { growthStage: newStage });
      setCrops(prev => prev.map(crop => 
        crop.Id === cropId ? updatedCrop : crop
      ));
      toast.success(`Growth stage updated to ${newStage}!`);
      setShowStageModal(false);
      setStageUpdateCrop(null);
    } catch (error) {
      toast.error("Failed to update growth stage. Please try again.");
      console.error("Error updating growth stage:", error);
    }
  };

const handleSaveCrop = async (cropDataOrId, cropData = null) => {
    if (cropData) {
      // Update existing crop
      await handleUpdateCrop(cropDataOrId, cropData);
    } else {
      // Create new crop
      await handleAddCrop(cropDataOrId);
    }
  };

const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingCrop(null);
  };

  const handleCloseStageModal = () => {
    setShowStageModal(false);
    setStageUpdateCrop(null);
  };

  const handleDeleteCrop = async (id) => {
    if (!window.confirm("Are you sure you want to delete this crop?")) {
      return;
    }

    try {
      await cropService.delete(id);
      setCrops(prev => prev.filter(c => c.Id !== id));
      toast.success("Crop deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete crop. Please try again.");
    }
  };

  if (loading) {
    return <Loading variant="table" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCrops} />;
  }

if (crops.length === 0) {
    return (
      <>
        <Empty
          title="No crops found"
          description="Start tracking your crops by planting your first crop in one of your fields."
          icon="Wheat"
          actionLabel="Add Your First Crop"
          onAction={() => setShowAddModal(true)}
        />
        <AddCropModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          onSave={handleSaveCrop}
          editCrop={editingCrop}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Crops
          </h1>
          <p className="text-gray-600 mt-1">
            Track your current crops and their growth status
          </p>
        </div>
<Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Crop
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crop & Field
</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Growth Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planting Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated Harvest
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
{crops.map((crop) => (
              <CropRow
                key={crop.Id}
                crop={crop}
                onEdit={handleEditCrop}
                onDelete={handleDeleteCrop}
                onStageUpdate={handleStageUpdate}
              />
            ))}
          </tbody>
        </table>
</div>

<AddCropModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSaveCrop}
        editCrop={editingCrop}
      />
      
      <GrowthStageModal
        isOpen={showStageModal}
        onClose={handleCloseStageModal}
        onSave={handleUpdateGrowthStage}
        crop={stageUpdateCrop}
      />
    </div>
  );
};

export default Crops;