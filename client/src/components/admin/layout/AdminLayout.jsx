import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      <div
        className={`flex flex-col h-full transition-all duration-300 ${
          isSidebarOpen ? "w-[calc(100%-16rem)]" : "w-[calc(100%-5rem)]"
        }`}
      >
        <Header />
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
