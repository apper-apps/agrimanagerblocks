import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import AddFertilizerModal from "@/components/organisms/AddFertilizerModal";
import FertilizerHistoryModal from "@/components/organisms/FertilizerHistoryModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import fertilizerService from "@/services/api/fertilizerService";

const FertilizerManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const statsData = await fertilizerService.getStats();
      setStats(statsData);
    } catch (err) {
      setError("Failed to load fertilizer data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadData();
  };

  if (loading) {
    return <Loading variant="cards" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (stats.totalApplications === 0) {
    return (
      <>
        <Empty
          title="No fertilizer applications recorded"
          description="Start tracking your fertilizer usage to monitor costs and application patterns across your fields."
          icon="Zap"
          actionLabel="Record First Application"
          onAction={() => setShowAddModal(true)}
        />
        
        <AddFertilizerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Fertilizer Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track fertilizer applications, costs, and usage patterns
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center"
          >
            <ApperIcon name="History" className="w-4 h-4 mr-2" />
            View History
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon="Zap"
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Cost"
          value={`$${stats.totalCost}`}
          icon="DollarSign"
          color="green"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Avg Cost/Application"
          value={`$${stats.avgCostPerApplication}`}
          icon="TrendingUp"
          color="purple"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Fertilizer Types"
          value={stats.uniqueFertilizerTypes}
          icon="Package"
          color="orange"
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <ApperIcon name="BarChart3" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Manage your fertilizer applications</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-green-200 hover:bg-green-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Record New Application</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Log fertilizer usage for your fields and crops
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="ml-4"
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">View Application History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Review past applications and cost analysis
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
                className="ml-4"
              >
                <ApperIcon name="History" className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddFertilizerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <FertilizerHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};

export default FertilizerManagement;