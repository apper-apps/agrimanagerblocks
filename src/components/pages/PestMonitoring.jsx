import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import AddPestObservationModal from "@/components/organisms/AddPestObservationModal";
import pestMonitoringService from "@/services/api/pestMonitoringService";
import fieldService from "@/services/api/fieldService";
import cropService from "@/services/api/cropService";

const PestMonitoring = () => {
  const [observations, setObservations] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingObservation, setEditingObservation] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [observationsData, fieldsData, cropsData] = await Promise.all([
        pestMonitoringService.getAll(),
        fieldService.getAll(),
        cropService.getAll()
      ]);
      setObservations(observationsData);
      setFields(fieldsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load pest monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddObservation = () => {
    setEditingObservation(null);
    setShowAddModal(true);
  };

  const handleEditObservation = (observation) => {
    setEditingObservation(observation);
    setShowAddModal(true);
  };

  const handleDeleteObservation = async (observationId) => {
    if (!window.confirm("Are you sure you want to delete this observation?")) {
      return;
    }

    try {
      await pestMonitoringService.delete(observationId);
      setObservations(prev => prev.filter(o => o.Id !== observationId));
      toast.success("Observation deleted successfully");
    } catch (err) {
      toast.error("Failed to delete observation");
    }
  };

  const handleModalSuccess = async () => {
    setShowAddModal(false);
    setEditingObservation(null);
    await loadData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFieldName = (fieldId) => {
    const field = fields.find(f => f.Id === fieldId);
    return field ? field.name : 'Unknown Field';
  };

  const getCropName = (cropId) => {
    if (!cropId) return 'N/A';
    const crop = crops.find(c => c.Id === cropId);
    return crop ? crop.name : 'Unknown Crop';
  };

  const getSeverityColor = (level) => {
    const colors = {
      1: 'text-green-600 bg-green-100',
      2: 'text-yellow-600 bg-yellow-100',
      3: 'text-orange-600 bg-orange-100',
      4: 'text-red-600 bg-red-100',
      5: 'text-red-800 bg-red-200'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'text-red-600 bg-red-100',
      'Monitoring': 'text-yellow-600 bg-yellow-100',
      'Resolved': 'text-green-600 bg-green-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Pest': 'text-red-600 bg-red-100',
      'Disease': 'text-purple-600 bg-purple-100',
      'Weed': 'text-orange-600 bg-orange-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  // Filter observations
  const filteredObservations = observations.filter(observation => {
    const matchesSearch = observation.pestType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         observation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = !selectedField || observation.fieldId.toString() === selectedField;
    const matchesStatus = !selectedStatus || observation.status === selectedStatus;
    const matchesCategory = !selectedCategory || observation.category === selectedCategory;
    
    return matchesSearch && matchesField && matchesStatus && matchesCategory;
  });

  if (loading) {
    return <Loading message="Loading pest monitoring data..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Pest & Disease Monitoring</h1>
            <p className="text-gray-600 mt-2">Track and manage pest and disease observations across your fields</p>
          </div>
          <Button onClick={handleAddObservation} className="mt-4 sm:mt-0">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Observation
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Input
              placeholder="Search pest type or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Fields</option>
            {fields.map(field => (
              <option key={field.Id} value={field.Id}>{field.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Pest">Pest</option>
            <option value="Disease">Disease</option>
            <option value="Weed">Weed</option>
          </select>
        </div>
      </div>

      {filteredObservations.length === 0 ? (
        <Empty 
          title="No observations found"
          description="No pest or disease observations match your current filters."
          action={{
            label: "Add First Observation",
            onClick: handleAddObservation
          }}
        />
      ) : (
        <div className="grid gap-6">
          {filteredObservations.map((observation) => (
            <div key={observation.Id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{observation.pestType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(observation.category)}`}>
                      {observation.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(observation.status)}`}>
                      {observation.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(observation.severityLevel)}`}>
                      Severity: {observation.severityLevel}/5
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
                      <span>{getFieldName(observation.fieldId)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Wheat" className="w-4 h-4 mr-2" />
                      <span>{getCropName(observation.cropId)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                      <span>{formatDate(observation.observationDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="Target" className="w-4 h-4 mr-2" />
                      <span>{observation.affectedArea} {observation.affectedAreaUnit}</span>
                    </div>
                    {observation.treatmentCost > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="DollarSign" className="w-4 h-4 mr-2" />
                        <span>${observation.treatmentCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <ApperIcon name="User" className="w-4 h-4 mr-2" />
                      <span>{observation.observedBy}</span>
                    </div>
                  </div>

                  {observation.description && (
                    <p className="text-gray-700 mb-3">{observation.description}</p>
                  )}

                  {observation.treatmentApplied && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <h4 className="font-medium text-blue-900 mb-1">Treatment Applied</h4>
                      <p className="text-blue-800 text-sm">{observation.treatmentApplied}</p>
                      {observation.treatmentDate && (
                        <p className="text-blue-600 text-xs mt-1">
                          Applied on {formatDate(observation.treatmentDate)}
                        </p>
                      )}
                    </div>
                  )}

                  {observation.followUpRequired && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                      <div className="flex items-center">
                        <ApperIcon name="Clock" className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-900">Follow-up Required</span>
                      </div>
                      {observation.followUpDate && (
                        <p className="text-yellow-800 text-sm mt-1">
                          Due: {formatDate(observation.followUpDate)}
                        </p>
                      )}
                    </div>
                  )}

                  {observation.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                      <p className="text-gray-700 text-sm">{observation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditObservation(observation)}
                    className="text-primary-600 border-primary-200 hover:bg-primary-50"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteObservation(observation.Id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPestObservationModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingObservation(null);
        }}
        observation={editingObservation}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PestMonitoring;