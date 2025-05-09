import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaShoppingBag,
  FaUsers,
  FaBookOpen,
  FaHandHoldingHeart,
  FaCreditCard,
  FaClipboardList,
  FaTags,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.profile?.role === "admin";
  const isApprovedSeller = user?.isSeller?.status === "approved";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        toggleSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [toggleSidebar]);

  const NavItem = ({ to, icon: Icon, children }) => {
    let isItemActive = false;

    return (
      <NavLink
        to={to}
        className={({ isActive }) => {
          isItemActive = isActive;
          return `flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out
          ${
            isActive
              ? "bg-purple-600 text-white shadow-md"
              : "text-purple-100 hover:bg-purple-700/50"
          }
          ${!isOpen ? "justify-center w-12 mx-auto" : "w-full"}`;
        }}
      >
        <Icon className={`text-xl ${isOpen ? "mr-3" : "mr-0"}`} />
        {isOpen && (
          <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden">
            {children}
          </span>
        )}
        {isItemActive && isOpen && (
          <div className="ml-auto w-1.5 h-6 rounded-full bg-indigo-300"></div>
        )}
      </NavLink>
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-purple-900 shadow-2xl transition-all duration-300 ease-in-out z-30 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
        {isOpen ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-2 shadow-inner shadow-purple-800">
              <FaBookOpen className="text-white text-lg" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              PustakBazzar
            </h2>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto bg-purple-600 rounded-lg flex items-center justify-center shadow-inner shadow-purple-800">
            <FaBookOpen className="text-white text-lg" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-purple-800/70 text-white hover:bg-purple-700 transition-colors shadow-md"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? (
            <FaTimes className="text-lg" />
          ) : (
            <FaBars className="text-lg" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 py-2 mt-2">
          <p className="text-xs uppercase text-purple-300 font-semibold tracking-wider">
            Main Menu
          </p>
        </div>
      )}

      <nav className="mt-2">
        <ul className="space-y-1 px-3">
          <li>
            <NavItem to="/admin/home" icon={FaHome}>
              Dashboard
            </NavItem>
          </li>

          {isAdmin && (
            <>
              <li>
                <NavItem to="/admin/managecategory" icon={FaTags}>
                  Categories
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/books" icon={FaBookOpen}>
                  Books
                </NavItem>
              </li>

              {isOpen && (
                <div className="px-1 py-2 mt-3">
                  <p className="text-xs uppercase text-purple-300 font-semibold tracking-wider">
                    Operations
                  </p>
                </div>
              )}

              <li>
                <NavItem to="/admin/admin-order" icon={FaClipboardList}>
                  Admin Orders
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/pendingDonation" icon={FaHandHoldingHeart}>
                  Donations
                </NavItem>
              </li>

              {isOpen && (
                <div className="px-1 py-2 mt-3">
                  <p className="text-xs uppercase text-purple-300 font-semibold tracking-wider">
                    Users & Finance
                  </p>
                </div>
              )}

              <li>
                <NavItem to="/admin/allUsers" icon={FaUsers}>
                  Manage Users
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/payout-history" icon={FaCreditCard}>
                  Sellers
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/payout" icon={FaMoneyCheckAlt}>
                  Payouts
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/messages" icon={FaMoneyCheckAlt}>
                  Messages
                </NavItem>
              </li>
            </>
          )}

          {(isApprovedSeller || isAdmin) && (
            <>
              {isOpen && !isAdmin && (
                <div className="px-1 py-2 mt-3">
                  <p className="text-xs uppercase text-purple-300 font-semibold tracking-wider">
                    Seller Menu
                  </p>
                </div>
              )}

              <li>
                <NavItem to="/admin/sellerorder" icon={FaShoppingBag}>
                  Orders
                </NavItem>
              </li>
            </>
          )}
        </ul>
      </nav>

      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-purple-300 text-xs">
          <p>&copy; {new Date().getFullYear()} PustakBazzar</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
