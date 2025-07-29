import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const CropRow = ({ crop, onEdit, onDelete, className }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "planted":
        return "bg-accent-100 text-accent-800";
      case "growing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-yellow-100 text-yellow-800";
      case "harvested":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr className={cn("hover:bg-gray-50 transition-colors duration-150", className)}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg mr-3">
            <ApperIcon name="Wheat" className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{crop.name}</div>
            <div className="text-sm text-gray-500">{crop.fieldName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={cn(
          "inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize",
          getStatusColor(crop.status)
        )}>
          {crop.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(crop.plantingDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {crop.estimatedHarvest ? formatDate(crop.estimatedHarvest) : "TBD"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit && onEdit(crop)}
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(crop.Id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default CropRow;