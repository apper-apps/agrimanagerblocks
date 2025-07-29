import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  className,
  trend,
  trendValue 
}) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center text-sm",
              trend === "up" ? "text-accent-600" : "text-red-600"
            )}>
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                className="w-4 h-4 mr-1" 
              />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
          <ApperIcon name={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;