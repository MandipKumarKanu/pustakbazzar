import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaTimes,
  FaShoppingCart,
  FaHome,
  FaBook,
  FaListAlt,
  FaEnvelope,
  FaBars,
} from "react-icons/fa";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import DropdownUser from "./DropDownUser";
import Logo from "../assets/image/logo.png";
import { ScrollProgress } from "./magicui/scroll-progress";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCartStore } from "@/store/useCartStore";
import { NumberTicker } from "./magicui/number-ticker";

const Navbar = () => {
  const { user } = useAuthStore();
  const { category: categories } = useCategoryStore();
  const { cartCount: cCnt } = useCartStore();

  let cartCount = typeof cCnt === "function" ? cCnt() : cCnt;

  const cartLength = 0;
  const navigate = useNavigate();
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("/");

  const handleTabChange = (path) => {
    setActiveTab(path);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsFixed(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const navbarClasses = `
    w-full 
    top-0 
    left-0 
    right-0 
    bg-white 
    z-50 
    transition-all 
    duration-300 
    ease-in-out
    ${
      isFixed
        ? "fixed shadow-md backdrop-blur-lg bg-white/80"
        : "relative shadow-none"
    }
    ${scrollY > 60 ? "py-2" : "py-3"}
    ${isMenuOpen ? "z-30" : "z-50"}
  `;

  const activeNavLink =
    "text-primary font-semibold relative after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-0.5 after:bg-primary";
  const inactiveNavLink =
    "text-gray-700 hover:text-primary transition-colors duration-200";

  const maxCategories = 9;
  const displayedCategories = categories.slice(0, maxCategories);

  const categoryRows = [];
  for (let i = 0; i < displayedCategories.length; i += 3) {
    categoryRows.push(displayedCategories.slice(i, i + 3));
  }

  return (
    <>
      <ScrollProgress className="z-999 h-1" />
      {isFixed && <div style={{ height: "72px" }} />}

      <nav className={navbarClasses}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <img
                src={Logo}
                alt="pustakbazzar"
                className="w-32 object-contain transition-all duration-300 hover:scale-105"
              />
            </Link>
          </div>

          <div className="hidden md:block">
            <ul className="flex gap-8 lg:gap-x-16 xl:gap-24 text-lg">
              <li className="cursor-pointer">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? activeNavLink : inactiveNavLink
                  }
                >
                  Home
                </NavLink>
              </li>
              <li className="cursor-pointer">
                <NavLink
                  to="/allbooks"
                  className={({ isActive }) =>
                    isActive ? activeNavLink : inactiveNavLink
                  }
                >
                  All Books
                </NavLink>
              </li>

              <li
                className="relative cursor-pointer"
                onMouseEnter={() => setCategoryOpen(true)}
                onMouseLeave={() => setCategoryOpen(false)}
              >
                <NavLink
                  to="/category"
                  className={({ isActive }) =>
                    isActive ? activeNavLink : inactiveNavLink
                  }
                >
                  Category
                </NavLink>
                {categoryOpen && (
                  <div className="absolute left-0 top-5 bg-white shadow-lg w-auto min-w-max mt-2 rounded-md p-4 z-50 border-2 border-gray-300">
                    <div className="grid grid-cols-3 gap-4">
                      {categoryRows.map((row, rowIndex) => (
                        <React.Fragment key={`row-${rowIndex}`}>
                          {row.map((category, colIndex) => (
                            <NavLink
                              key={`category-${rowIndex}-${colIndex}`}
                              to={`/category/${category.label}`}
                              state={{ value: category.value }}
                              className="block px-4 py-2 text-gray-700 capitalize hover:bg-gray-100 hover:text-primary rounded transition-colors duration-200 whitespace-nowrap"
                              onClick={() => setCategoryOpen(false)}
                            >
                              {category.label}
                            </NavLink>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </li>

              <li className="cursor-pointer">
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive ? activeNavLink : inactiveNavLink
                  }
                >
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-5">
            {!user ? (
              <NavLink to="/auth" className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-center bg-white rounded-full p-2 hover:shadow-md transition duration-200">
                  <FaUser className="text-gray-700 group-hover:text-primary cursor-pointer text-lg" />
                </div>
              </NavLink>
            ) : (
              <>
                <DropdownUser />
                {
                  <NavLink
                    to="/cart"
                    className="hidden md:flex relative items-center justify-center group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative p-2 bg-white rounded-full hover:shadow-md transition duration-200">
                      <FaShoppingCart className="text-gray-700 group-hover:text-primary text-lg" />
                      {user && (
                        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold">
                          <NumberTicker
                            value={cartCount}
                            className="whitespace-pre-wrap font-medium tracking-tighter text-white"
                          />
                        </span>
                      )}
                    </div>
                  </NavLink>
                }
              </>
            )}
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-white z-50 transition-all duration-500 ease-in-out md:hidden ${
          isMenuOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-6 pt-6 pb-8 h-full flex flex-col overflow-y-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">Menu</h2>
              <div className="h-1 w-16 bg-gradient-to-r from-primaryColor to-secondaryColor rounded-full"></div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              <FaTimes className="text-xl text-gray-700" />
            </button>
          </div>

          <ul className="flex flex-col gap-5">
            {[
              { path: "/", label: "Home", icon: <FaHome /> },
              { path: "/allbooks", label: "All Books", icon: <FaBook /> },
              { path: "/category", label: "Categories", icon: <FaListAlt /> },
              { path: "/contact", label: "Contact Us", icon: <FaEnvelope /> },
              { path: "/cart", label: "My Cart", icon: <FaShoppingCart /> },
            ].map((item) => (
              <li key={item.path} className="overflow-hidden">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-t from-primaryColor to-secondaryColor text-white shadow-lg transform scale-102"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-lg font-medium">{item.label}</span>
                  {item.path === "/cart" && user && cartCount > 0 && (
                    <span className="ml-auto bg-white text-primaryColor rounded-full h-6 min-w-6 px-2 flex items-center justify-center text-sm font-bold">
                      <NumberTicker
                        value={cartCount}
                        className="whitespace-pre-wrap font-medium"
                      />
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {categories.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Popular Categories
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 6).map((category, index) => (
                  <NavLink
                    key={`mobile-category-${index}`}
                    to={`/category/${category.label}`}
                    state={{ value: category.value }}
                    className={`text-sm px-3 py-2 rounded-lg border border-gray-200 capitalize ${
                      location.pathname === `/category/${category.label}`
                        ? "bg-gradient-to-t from-primaryColor/20 to-secondaryColor/20 border-primaryColor text-primaryColor font-medium"
                        : "text-gray-600 hover:border-primaryColor hover:bg-primaryColor/5"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.label}
                  </NavLink>
                ))}
              </div>
              {categories.length > 6 && (
                <NavLink
                  to="/category"
                  className="mt-3 text-primaryColor text-sm font-medium inline-block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  + View all categories
                </NavLink>
              )}
            </div>
          )}

          <div className="mt-auto">
            <div className="py-6 border-t border-gray-200">
              {!user ? (
                <div className="flex gap-3">
                  <NavLink
                    to="/auth"
                    className="flex-1 py-3 px-5 bg-gradient-to-t from-primaryColor to-secondaryColor text-white rounded-lg text-center font-medium shadow-lg hover:shadow-xl transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/auth?register=true"
                    className="flex-1 py-3 px-5 border-2 border-gray-300 text-gray-700 rounded-lg text-center font-medium hover:border-primaryColor hover:text-primaryColor transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </NavLink>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-3 py-3 px-6 bg-gradient-to-t from-primaryColor/10 to-secondaryColor/10 text-primaryColor rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-t from-primaryColor to-secondaryColor flex items-center justify-center text-white font-bold">
                      {user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <span className="font-medium">My Profile</span>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {[
            { path: "/", icon: <FaHome />, label: "Home" },
            { path: "/allbooks", icon: <FaBook />, label: "Books" },
            { path: "/category", icon: <FaListAlt />, label: "Categories" },
            {
              path: "/cart",
              icon: <FaShoppingCart />,
              label: "Cart",
              badge: cartCount > 0 ? cartCount : null,
            },
            {
              path: "#",
              icon: <FaBars />,
              label: "Menu",
              action: () => setIsMenuOpen(true),
            },
          ].map((item) =>
            item.path === "#" ? (
              <button
                key="menu-button"
                onClick={item.action}
                className="flex flex-col items-center justify-center transition-colors duration-200 relative text-gray-500 hover:text-primaryColor"
              >
                <div className="text-xl">{item.icon}</div>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center transition-colors duration-200 relative ${
                    isActive ? "text-primaryColor" : "text-gray-500"
                  }`
                }
              >
                <div
                  className={`text-xl ${
                    location.pathname === item.path ? "text-primaryColor" : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 right-6 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold">
                    <NumberTicker
                      value={item.badge}
                      className="whitespace-pre-wrap font-medium text-white"
                    />
                  </span>
                )}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 h-1 w-8 bg-gradient-to-r from-primaryColor to-secondaryColor rounded-t-full"></div>
                )}
              </NavLink>
            )
          )}
        </div>
      </div>

      {/* <div className="h-16 md:h-0"></div> */}
    </>
  );
};

export default Navbar;
