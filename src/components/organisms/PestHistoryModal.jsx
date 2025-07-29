import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import pestMonitoringService from "@/services/api/pestMonitoringService";
import cropService from "@/services/api/cropService";

const PestHistoryModal = ({ isOpen, onClose, field }) => {
  const [observations, setObservations] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (isOpen && field) {
      loadObservations();
    }
  }, [isOpen, field]);

  const loadObservations = async () => {
    try {
      setLoading(true);
      const [observationsData, cropsData] = await Promise.all([
        pestMonitoringService.getByFieldId(field.Id),
        cropService.getAll()
      ]);
      setObservations(observationsData.sort((a, b) => new Date(b.observationDate) - new Date(a.observationDate)));
      setCrops(cropsData);
    } catch (err) {
      toast.error("Failed to load pest observations");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const filteredObservations = selectedStatus 
    ? observations.filter(obs => obs.status === selectedStatus)
    : observations;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pest & Disease History</h2>
            <p className="text-sm text-gray-600 mt-1">Field: {field?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ApperIcon name="X" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
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
            </div>
            
            <div className="text-sm text-gray-600">
              Total Observations: {filteredObservations.length}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loading message="Loading observations..." />
              </div>
            ) : filteredObservations.length === 0 ? (
              <Empty 
                title="No observations found"
                description={selectedStatus ? `No ${selectedStatus.toLowerCase()} observations for this field.` : "No pest or disease observations recorded for this field."}
              />
            ) : (
              <div className="space-y-4">
                {filteredObservations.map((observation) => (
                  <div key={observation.Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{observation.pestType}</h3>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <ApperIcon name="Wheat" className="w-4 h-4 mr-2" />
                            <span>{getCropName(observation.cropId)}</span>
                          </div>
                          <div className="flex items-center">
                            <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                            <span>{formatDate(observation.observationDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <ApperIcon name="Target" className="w-4 h-4 mr-2" />
                            <span>{observation.affectedArea} {observation.affectedAreaUnit}</span>
                          </div>
                          {observation.treatmentCost > 0 && (
                            <div className="flex items-center">
                              <ApperIcon name="DollarSign" className="w-4 h-4 mr-2" />
                              <span>${observation.treatmentCost.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <ApperIcon name="User" className="w-4 h-4 mr-2" />
                            <span>{observation.observedBy}</span>
                          </div>
                        </div>

                        {observation.description && (
                          <p className="text-gray-700 mb-3">{observation.description}</p>
                        )}

                        <div className="space-y-2">
                          {observation.treatmentApplied && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <ApperIcon name="Shield" className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="font-medium text-blue-900">Treatment Applied</span>
                              </div>
                              <p className="text-blue-800 text-sm">{observation.treatmentApplied}</p>
                              {observation.treatmentDate && (
                                <p className="text-blue-600 text-xs mt-1">
                                  Applied on {formatDate(observation.treatmentDate)}
                                </p>
                              )}
                            </div>
                          )}

                          {observation.followUpRequired && (
                            <div className="bg-yellow-50 p-3 rounded-lg">
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
                              <div className="flex items-center mb-1">
                                <ApperIcon name="FileText" className="w-4 h-4 text-gray-600 mr-2" />
                                <span className="font-medium text-gray-900">Notes</span>
                              </div>
                              <p className="text-gray-700 text-sm">{observation.notes}</p>
                            </div>
                          )}

                          {observation.photos && observation.photos.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-2">
                                <ApperIcon name="Camera" className="w-4 h-4 text-gray-600 mr-2" />
                                <span className="font-medium text-gray-900">Photos ({observation.photos.length})</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {observation.photos.slice(0, 3).map((photo, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={photo.data}
                                      alt={photo.name}
                                      className="w-full h-16 object-cover rounded border"
                                    />
                                  </div>
                                ))}
                                {observation.photos.length > 3 && (
                                  <div className="flex items-center justify-center bg-gray-200 h-16 rounded border text-sm text-gray-600">
                                    +{observation.photos.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default PestHistoryModal;