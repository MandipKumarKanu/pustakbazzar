import React from "react";
import { motion } from "framer-motion";
import { FiSearch, FiChevronDown, FiGrid, FiList, FiShoppingBag } from "react-icons/fi";

const OrderFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  viewMode,
  setViewMode
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-500">Track and manage your orders</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mr-3">
            <button 
              className={`p-2 ${viewMode === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setViewMode("grid")}
            >
              <FiGrid size={20} />
            </button>
            <button 
              className={`p-2 ${viewMode === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
              onClick={() => setViewMode("list")}
            >
              <FiList size={20} />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm"
          >
            <FiShoppingBag className="mr-2" />
            Continue Shopping
          </motion.button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <select
              className="appearance-none w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderFilters;