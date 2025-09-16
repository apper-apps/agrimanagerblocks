import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
const navItems = [
    { name: "Dashboard", icon: "BarChart3", path: "/" },
    { name: "Fields", icon: "MapPin", path: "/fields" },
    { name: "Crops", icon: "Wheat", path: "/crops" },
    { name: "Planting Records", icon: "Sprout", path: "/planting-records" },
    { name: "Fertilizer Management", icon: "Zap", path: "/fertilizer" },
    { name: "Pest Monitoring", icon: "Shield", path: "/pest-monitoring" },
{ name: "Equipment", icon: "Truck", path: "/equipment" },
    { name: "Task Management", icon: "CheckSquare", path: "/tasks" },
    { name: "Financial Management", icon: "DollarSign", path: "/financial" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center">
          <div className="p-2 bg-white/20 rounded-lg mr-3">
            <ApperIcon name="Sprout" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">AgriManager</h1>
            <p className="text-sm text-white/70">Farm Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "sidebar-nav-item",
                    isActive && "active"
                  )
                }
                onClick={() => onClose && onClose()}
              >
                <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center text-white/70 text-sm">
          <ApperIcon name="User" className="w-4 h-4 mr-2" />
          <span>Farm Owner</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-primary-600 to-primary-700 shadow-xl">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-br from-primary-600 to-primary-700 shadow-xl transform transition-transform duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <ApperIcon name="X" className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;