import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ title, onMenuClick, className }) => {
  return (
    <header className={cn(
      "bg-white border-b border-gray-200 shadow-sm",
      "lg:ml-64",
      className
    )}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden -ml-2 mr-2"
              onClick={onMenuClick}
            >
              <ApperIcon name="Menu" className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 font-display">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-sm text-gray-600">
              <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
              <span>{new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;