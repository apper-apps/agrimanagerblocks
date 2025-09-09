import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { AuthContext } from "../../App";
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
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
};

const UserProfile = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { logout } = useContext(AuthContext);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="hidden sm:block text-right">
        <div className="text-sm font-medium text-gray-900">
          {user?.firstName} {user?.lastName}
        </div>
        <div className="text-xs text-gray-500">
          {user?.emailAddress}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="flex items-center gap-1"
      >
        <ApperIcon name="LogOut" className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
};

export default Header;