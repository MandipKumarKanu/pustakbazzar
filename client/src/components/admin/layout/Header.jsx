import React from "react";
import AdminDropdown from "./AdminDropdown";
// import NotificationPanel from "./NotificationPanel";

const Header = () => {
  return (
    <header className="w-full h-16 bg-gradient-to-r from-purple-700 to-indigo-700 sticky top-0 z-20 shadow-md flex justify-between items-center px-6">
      <div className="flex items-center space-x-4">
        <div className="bg-purple-900 p-2 rounded-full shadow-md"></div>
        <span className="text-white text-2xl font-bold tracking-wide">
          Admin Panel
        </span>
      </div>

      <div className="flex items-center space-x-6">
        {/* <NotificationPanel /> */}
        <AdminDropdown />
      </div>
    </header>
  );
};

export default Header;
