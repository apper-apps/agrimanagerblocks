import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const FieldCard = ({ field, onEdit, onDelete, className }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-accent-100 text-accent-800";
      case "fallow":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={cn("field-card", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mr-3">
            <ApperIcon name="MapPin" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-display">
              {field.name}
            </h3>
            <p className="text-sm text-gray-600">{field.location}</p>
          </div>
        </div>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium capitalize",
          getStatusColor(field.status)
        )}>
          {field.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Maximize" className="w-4 h-4 mr-2 text-primary-500" />
          <span>{field.sizeInAcres} acres</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-primary-500" />
          <span>Added {formatDate(field.createdAt)}</span>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit && onEdit(field)}
          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
        >
          <ApperIcon name="Edit2" className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete && onDelete(field.Id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ApperIcon name="Trash2" className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default FieldCard;