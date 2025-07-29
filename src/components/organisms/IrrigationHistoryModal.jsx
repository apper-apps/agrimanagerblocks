import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import irrigationService from '@/services/api/irrigationService';

const IrrigationHistoryModal = ({ isOpen, onClose, field }) => {
  const [irrigationRecords, setIrrigationRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const irrigationMethodLabels = {
    sprinkler: 'Sprinkler System',
    drip: 'Drip Irrigation',
    flood: 'Flood Irrigation',
    manual: 'Manual Watering'
  };

  const irrigationMethodIcons = {
    sprinkler: 'Zap',
    drip: 'Droplets',
    flood: 'Waves',
    manual: 'Hand'
  };

  useEffect(() => {
    if (isOpen && field) {
      loadIrrigationHistory();
    }
  }, [isOpen, field]);

  const loadIrrigationHistory = async () => {
    setLoading(true);
    try {
      const records = await irrigationService.getByFieldId(field.Id);
      setIrrigationRecords(records);
    } catch (error) {
      console.error('Error loading irrigation history:', error);
      setIrrigationRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Irrigation History</h3>
            <p className="text-sm text-gray-500 mt-1">{field?.name} - All irrigation records</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <Loading />
          ) : irrigationRecords.length === 0 ? (
            <Empty
              icon="Droplets"
              title="No irrigation records"
              description={`No irrigation activities have been logged for ${field?.name} yet.`}
            />
          ) : (
            <div className="space-y-4">
              {irrigationRecords.map((record) => (
                <div
                  key={record.Id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <ApperIcon 
                          name={irrigationMethodIcons[record.irrigationMethod] || 'Droplets'} 
                          size={16} 
                          className="text-blue-600" 
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {irrigationMethodLabels[record.irrigationMethod] || record.irrigationMethod}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {record.waterAmount.toLocaleString()} gal
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDuration(record.duration)}
                      </p>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-100">
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IrrigationHistoryModal;