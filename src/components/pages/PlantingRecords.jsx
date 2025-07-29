import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import AddPlantingRecordModal from "@/components/organisms/AddPlantingRecordModal";
import plantingRecordService from "@/services/api/plantingRecordService";

const PlantingRecords = () => {
  const [plantingRecords, setPlantingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadPlantingRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await plantingRecordService.getAll();
      setPlantingRecords(data);
    } catch (err) {
      setError("Failed to load planting records. Please try again.");
      toast.error("Failed to load planting records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlantingRecords();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this planting record?")) {
      return;
    }

    try {
      await plantingRecordService.delete(id);
      setPlantingRecords(plantingRecords.filter(record => record.Id !== id));
      toast.success("Planting record deleted successfully");
    } catch (err) {
      toast.error("Failed to delete planting record");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleModalSuccess = () => {
    loadPlantingRecords();
    handleModalClose();
  };

  const filteredRecords = plantingRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.plantingMethod.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterMethod || record.plantingMethod === filterMethod;
    
    return matchesSearch && matchesFilter;
  });

  const plantingMethods = plantingRecordService.getPlantingMethods();

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPlantingRecords} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Planting Records
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage your planting activities
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={18} />
          Add Planting Record
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search by crop, field, or method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="lg:w-64">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Methods</option>
              {plantingMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredRecords.length === 0 ? (
        <Empty 
          message={searchTerm || filterMethod ? "No planting records match your filters" : "No planting records yet"} 
          actionText={!(searchTerm || filterMethod) ? "Add Your First Record" : undefined}
          onAction={!(searchTerm || filterMethod) ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-6">
          {filteredRecords.map((record) => (
            <div
              key={record.Id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 font-display">
                      {record.cropName}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {record.fieldName}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                      {record.plantingMethod}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Calendar" size={16} className="text-gray-400" />
                      <span className="text-gray-600">Planted:</span>
                      <span className="font-medium">
                        {new Date(record.plantingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Package" size={16} className="text-gray-400" />
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{record.seedQuantity} units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Sprout" size={16} className="text-gray-400" />
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium">{record.plantingMethod}</span>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {record.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <ApperIcon name="Edit2" size={16} />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(record.Id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <ApperIcon name="Trash2" size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddPlantingRecordModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        record={selectedRecord}
      />
    </div>
  );
};

export default PlantingRecords;