import React, { useEffect, useState } from "react";
import plantingRecordService from "@/services/api/plantingRecordService";
import cropService from "@/services/api/cropService";
import fieldService from "@/services/api/fieldService";
import financialService from "@/services/api/financialService";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Fields from "@/components/pages/Fields";
import Crops from "@/components/pages/Crops";

const Dashboard = () => {
const [fieldStats, setFieldStats] = useState({});
  const [cropStats, setCropStats] = useState({});
  const [plantingStats, setPlantingStats] = useState({});
  const [financialStats, setFinancialStats] = useState({});
  const [recentPlantings, setRecentPlantings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [fieldData, cropData, plantingData, financialData, recentData] = await Promise.all([
        fieldService.getStats(),
        cropService.getStats(),
        plantingRecordService.getStats(),
        financialService.getStats(),
        plantingRecordService.getRecent(3)
      ]);
      
      setFieldStats(fieldData);
      setCropStats(cropData);
      setPlantingStats(plantingData);
      setFinancialStats(financialData);
      setRecentPlantings(recentData);
    } catch (err) {
      setError("Failed to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <Loading variant="stats" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadStats} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Farm Overview
        </h1>
        <p className="text-gray-600">
          Monitor your fields and crops at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Fields"
          value={fieldStats.totalFields || 0}
          icon="MapPin"
          trend="up"
          trendValue="+2 this month"
        />
<StatCard
          title="Active Fields"
          value={fieldStats.activeFields || 0}
          icon="CheckCircle"
          trend="up"
          trendValue={`${fieldStats.totalAcres || 0} acres`}
        />
        <StatCard
          title="Active Crops"
          value={cropStats.activeCrops || 0}
          icon="Wheat"
          trend="up"
          trendValue="Growing season"
        />
        <StatCard
          title="Ready to Harvest"
          value={cropStats.readyToHarvest || 0}
          icon="Calendar"
          trend="up"
          trendValue="This week"
        />
        <StatCard
          title="Pending Tasks"
          value={12}
          icon="CheckSquare"
          trend="up"
          trendValue="High priority"
        />
      </div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            Field Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Fields</span>
              <span className="font-semibold text-gray-900">{fieldStats.totalFields || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Fields</span>
              <span className="font-semibold text-accent-600">{fieldStats.activeFields || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fallow Fields</span>
              <span className="font-semibold text-yellow-600">{fieldStats.fallowFields || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Acres</span>
              <span className="font-semibold text-primary-600">{fieldStats.totalAcres || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            Crop Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Crops</span>
              <span className="font-semibold text-gray-900">{cropStats.totalCrops || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Crops</span>
              <span className="font-semibold text-accent-600">{cropStats.activeCrops || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ready to Harvest</span>
              <span className="font-semibold text-yellow-600">{cropStats.readyToHarvest || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Harvested</span>
              <span className="font-semibold text-gray-600">{cropStats.harvested || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            Planting Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Records</span>
              <span className="font-semibold text-gray-900">{plantingStats.totalRecords || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-accent-600">{plantingStats.thisMonthRecords || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unique Crops</span>
              <span className="font-semibold text-primary-600">{plantingStats.uniqueCrops || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fields Used</span>
              <span className="font-semibold text-earth-600">{plantingStats.uniqueFields || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Planting Activities */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display">
            Recent Planting Activities
          </h3>
          <button
            onClick={() => window.location.href = '/planting-records'}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            View All
          </button>
        </div>
        
        {recentPlantings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ApperIcon name="Sprout" size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">No planting records yet</p>
            <button
              onClick={() => window.location.href = '/planting-records'}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              Add Your First Planting Record
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPlantings.map((planting) => (
              <div
                key={planting.Id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="Sprout" size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{planting.cropName}</p>
                    <p className="text-sm text-gray-600">
                      {planting.fieldName} • {planting.plantingMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {planting.seedQuantity} units
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(planting.plantingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
)}

        {/* Financial Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ApperIcon name="DollarSign" className="w-5 h-5 mr-2 text-green-600" />
              Financial Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Expenses"
              value={`$${financialStats.totalExpenses?.toLocaleString() || '0'}`}
              icon="TrendingDown"
              className="text-red-600"
            />
            <StatCard
              title="Total Income"
              value={`$${financialStats.totalIncome?.toLocaleString() || '0'}`}
              icon="TrendingUp"
              className="text-green-600"
            />
            <StatCard
              title="Net Profit"
              value={`$${financialStats.netProfit?.toLocaleString() || '0'}`}
              icon={financialStats.netProfit >= 0 ? "TrendingUp" : "TrendingDown"}
              className={financialStats.netProfit >= 0 ? "text-green-600" : "text-red-600"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;