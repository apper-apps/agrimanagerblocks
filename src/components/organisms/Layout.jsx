import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
const getPageTitle = () => {
    switch (location.pathname) {
case "/":
        return "Dashboard";
      case "/fields":
        return "Fields";
      case "/crops":
        return "Crops";
      case "/planting-records":
        return "Planting Records";
      case "/fertilizer":
        return "Fertilizer Management";
      case "/pest-monitoring":
        return "Pest Monitoring";
      case "/financial":
        return "Financial Management";
case "/tasks":
        return "Task Management";
      case "/equipment":
        return "Equipment Management";
      default:
        return "AgriManager";
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex flex-col lg:ml-64">
        <Header 
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;