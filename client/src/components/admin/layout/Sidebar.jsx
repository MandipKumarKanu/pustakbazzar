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
  FaChartLine,
  FaCommentDots,
  FaFileInvoiceDollar,
  FaBookReader,
  FaChartBar,
  FaChartPie,
  FaUsersCog,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";

const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.profile?.role === "admin";
  const isApprovedSeller = user?.isSeller?.status === "approved";

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = scrollbarHideStyles;
    document.head.appendChild(styleEl);

    const handleResize = () => {
      if (window.innerWidth < 768) {
        toggleSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.head.removeChild(styleEl);
    };
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

  const SectionHeader = ({ title }) => {
    if (!isOpen) return null;

    return (
      <div className="px-1 py-2 mt-3 mb-1">
        <p className="text-xs uppercase text-purple-300 font-semibold tracking-wider">
          {title}
        </p>
      </div>
    );
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-purple-900 shadow-2xl transition-all duration-300 ease-in-out z-30 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
        {isOpen && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-2 shadow-inner shadow-purple-800">
              <FaBookOpen className="text-white text-lg" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              PustakBazzar
            </h2>
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

      <SectionHeader title="Main Menu" />

      <nav className="mt-2 pb-16 overflow-y-auto scrollbar-hide max-h-full">
        <ul className="space-y-1 px-3">
          <li>
            <NavItem to="/admin/home" icon={FaHome}>
              Dashboard
            </NavItem>
          </li>

          {isAdmin && (
            <>
              <SectionHeader title="Catalog" />

              <li>
                <NavItem to="/admin/managecategory" icon={FaTags}>
                  Categories
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/books" icon={FaBookReader}>
                  Books
                </NavItem>
              </li>

              <SectionHeader title="Orders & Donations" />

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

              <SectionHeader title="Users & Sellers" />

              <li>
                <NavItem to="/admin/allUsers" icon={FaUsersCog}>
                  Manage Users
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/payout-history" icon={FaCreditCard}>
                  Sellers
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/messages" icon={FaCommentDots}> {/* Admin Messages Link */}
                  Messages 
                </NavItem>
              </li>

              <SectionHeader title="Finance" />

              <li>
                <NavItem to="/admin/payout" icon={FaMoneyBillWave}>
                  Payouts
                </NavItem>
              </li>

              <SectionHeader title="Reports & Analytics" />

              <li>
                <NavItem
                  to="/admin/PlatformFeeReport"
                  icon={FaFileInvoiceDollar}
                >
                  Platform Fee Report
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/SalesPerformanceReport" icon={FaChartBar}>
                  Sales Performance
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/bookreport" icon={FaChartPie}>
                  Book Report
                </NavItem>
              </li>
            </>
          )}

          {(isApprovedSeller || isAdmin) && !isAdmin && (
            <>
              <SectionHeader title="Seller Menu" />

              <li>
                <NavItem to="/admin/sellerorder" icon={FaShoppingBag}>
                  Orders
                </NavItem>
              </li>
              <li>
                <NavItem to="/admin/messages" icon={FaCommentDots}> {/* Seller Messages Link */}
                  Messages
                </NavItem>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-purple-300 text-xs border-t border-purple-700/30 bg-purple-900">
          <p>&copy; {new Date().getFullYear()} PustakBazzar</p>
        </div>
      )} */}
    </div>
  );
};

export default Sidebar;
