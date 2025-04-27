import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaUsers, FaBook, FaSignOutAlt, FaCog } from "react-icons/fa";
import ClickOutside from "@/hooks/ClickOutside";
import { useAuthStore } from "@/store/useAuthStore";
import { logoutApi } from "@/api/auth";

const AdminDropdown = () => {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // logout();
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-white uppercase">
            {user?.profile?.firstName} {user?.profile?.lastName} 
          </span>
        </span>

        <div className="flex items-center gap-3 justify-center">
          <FaUser className="text-white cursor-pointer text-lg ml-3" />
          <svg
            className="hidden fill-white sm:block"
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
            transition={{ duration: 0.3 }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
              fill=""
            />
          </svg>
        </div>
      </Link>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-64 flex-col rounded-xl border border-stroke bg-white shadow-lg z-10">
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-4">
            {/* <li>
              <Link
                to="/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                onClick={() => setDropdownOpen(false)}
              >
                <FaUser />
                Admin Profile
              </Link>
            </li> */}

            {/* <li>
              <Link
                to="/admin/manage-users"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                onClick={() => setDropdownOpen(false)}
              >
                <FaUsers />
                Manage Users
              </Link>
            </li> */}

            {/* <li>
              <Link
                to="/admin/manage-books"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                onClick={() => setDropdownOpen(false)}
              >
                <FaBook />
                Manage Books
              </Link>
            </li> */}

            <li>
              <Link
                // to="/admin/settings"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                onClick={() => setDropdownOpen(false)}
              >
                <FaCog />
                Settings
              </Link>
            </li>
          </ul>
          <button
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Back to Pustakbazzar
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-medium">
              You have been logged out successfully.
            </p>
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default AdminDropdown;
