import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import fertilizerService from "@/services/api/fertilizerService";
import fieldService from "@/services/api/fieldService";
import cropService from "@/services/api/cropService";

const FertilizerHistoryModal = ({ isOpen, onClose, field }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, field]);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, fieldsData, cropsData] = await Promise.all([
        field ? fertilizerService.getByFieldId(field.Id) : fertilizerService.getAll(),
        fieldService.getAll(),
        cropService.getAll()
      ]);
      
      setRecords(recordsData.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)));
      setFields(fieldsData);
      setCrops(cropsData);
    } catch (error) {
      toast.error("Failed to load fertilizer history");
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchTerm) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record => {
      const fieldName = getFieldName(record.fieldId);
      const cropName = getCropName(record.cropId);
      
      return (
        record.fertilizerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.applicationMethod.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    setFilteredRecords(filtered);
  };

  const getFieldName = (fieldId) => {
    const field = fields.find(f => f.Id === fieldId);
    return field ? field.name : "Unknown Field";
  };

  const getCropName = (cropId) => {
    if (!cropId) return "No Crop";
    const crop = crops.find(c => c.Id === cropId);
    return crop ? crop.name : "Unknown Crop";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateTotalCost = () => {
    return filteredRecords.reduce((sum, record) => sum + record.totalCost, 0).toFixed(2);
  };

  const calculateTotalQuantity = () => {
    const totalByUnit = filteredRecords.reduce((acc, record) => {
      acc[record.unit] = (acc[record.unit] || 0) + record.quantityUsed;
      return acc;
    }, {});

    return Object.entries(totalByUnit)
      .map(([unit, quantity]) => `${quantity.toFixed(1)} ${unit}`)
      .join(", ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <ApperIcon name="History" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Fertilizer History {field && `- ${field.name}`}
              </h2>
              <p className="text-sm text-gray-600">View fertilizer application records and costs</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : (
          <>
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search fertilizer applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:w-80">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Total Cost</p>
                    <p className="text-lg font-bold text-green-700">${calculateTotalCost()}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Applications</p>
                    <p className="text-lg font-bold text-blue-700">{filteredRecords.length}</p>
                  </div>
                </div>
              </div>
              
              {filteredRecords.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Total Quantity:</span> {calculateTotalQuantity()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredRecords.length === 0 ? (
                <div className="p-8">
                  <Empty
                    title="No fertilizer records found"
                    description={searchTerm ? "Try adjusting your search criteria" : "No fertilizer applications have been recorded yet"}
                    icon="Zap"
                  />
                </div>
              ) : (
                <div className="p-6">
                  <div className="space-y-4">
                    {filteredRecords.map((record) => (
                      <div key={record.Id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{record.fertilizerType}</h3>
                            <p className="text-sm text-gray-600">
                              {getFieldName(record.fieldId)} • {getCropName(record.cropId)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${record.totalCost.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{formatDate(record.applicationDate)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <p className="font-medium">{record.quantityUsed} {record.unit}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost/Unit:</span>
                            <p className="font-medium">${record.costPerUnit}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Method:</span>
                            <p className="font-medium">{record.applicationMethod}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <p className="font-medium">{formatDate(record.applicationDate)}</p>
                          </div>
                        </div>
                        
                        {record.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FertilizerHistoryModal;