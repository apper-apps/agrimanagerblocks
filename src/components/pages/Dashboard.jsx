import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import fieldService from "@/services/api/fieldService";
import cropService from "@/services/api/cropService";

const Dashboard = () => {
  const [fieldStats, setFieldStats] = useState({});
  const [cropStats, setCropStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [fieldData, cropData] = await Promise.all([
        fieldService.getStats(),
        cropService.getStats()
      ]);
      
      setFieldStats(fieldData);
      setCropStats(cropData);
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      </div>
    </div>
  );
};

export default Dashboard;