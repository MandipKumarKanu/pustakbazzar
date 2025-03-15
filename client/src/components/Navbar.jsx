import React, { useState, useEffect } from "react";
import { FaUser, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const { cartCount } = useCartStore();

  console.log(cartCount());

  const cartLength = 0;
  const navigate = useNavigate();
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);

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
  `;

  const activeNavLink =
    "text-primary font-semibold relative after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-0.5 after:bg-primary";
  const inactiveNavLink =
    "text-gray-700 hover:text-primary transition-colors duration-200";

  // const categories = [
  //   { name: "Fiction", path: "/category/fiction" },
  //   { name: "Non-fiction", path: "/category/non-fiction" },
  //   { name: "Educational", path: "/category/educational" },
  //   { name: "Science", path: "/category/science" },
  //   { name: "History", path: "/category/history" },
  //   { name: "Biography", path: "/category/biography" },
  //   { name: "Self-Help", path: "/category/self-help" },
  //   { name: "Business", path: "/category/business" },
  //   { name: "Thriller", path: "/category/thriller" },
  //   { name: "Romance", path: "/category/romance" },
  //   { name: "Mystery", path: "/category/mystery" },
  //   { name: "Poetry", path: "/category/poetry" },
  // ];

  const categoryRows = [];
  for (let i = 0; i < categories.length; i += 3) {
    categoryRows.push(categories.slice(i, i + 3));
  }

  return (
    <>
      <ScrollProgress className="z-999 h-1" />
      {isFixed && <div style={{ height: "72px" }} />}

      <nav className={navbarClasses}>
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center">
            <img
              src={Logo}
              alt="pustakbazzar"
              className="w-32 object-contain transition-all duration-300 hover:scale-105"
            />
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
                {!isCartPage && (
                  <NavLink
                    to="/cart"
                    className="hidden md:flex relative items-center justify-center group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative p-2 bg-white rounded-full hover:shadow-md transition duration-200">
                      <FaShoppingCart className="text-gray-700 group-hover:text-primary text-lg" />
                      {cartCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold">
                          {/* {cartCount()} */}
                          <NumberTicker
                            value={cartCount()}
                            className="whitespace-pre-wrap font-medium tracking-tighter text-white"
                          />
                        </span>
                      )}
                    </div>
                  </NavLink>
                )}
              </>
            )}
            <button
              className="md:hidden relative group z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative p-2 bg-white rounded-full hover:shadow-md transition duration-200">
                {isMenuOpen ? (
                  <FaTimes className="text-lg text-gray-700 group-hover:text-primary" />
                ) : (
                  <FaBars className="text-lg text-gray-700 group-hover:text-primary" />
                )}
              </div>
            </button>
          </div>
        </div>

        <div
          className={`fixed inset-0 bg-white/95 backdrop-blur-lg z-40 transition-transform duration-300 ease-in-out md:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="container mx-auto px-6 pt-24 pb-8 h-full flex flex-col">
            <ul className="flex flex-col gap-8 text-2xl font-medium">
              <li className="transform hover:translate-x-3 transition-transform duration-200 cursor-pointer">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-semibold"
                      : "text-gray-700 hover:text-primary"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li className="transform hover:translate-x-3 transition-transform duration-200 cursor-pointer">
                <NavLink
                  to="/allbooks"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-semibold"
                      : "text-gray-700 hover:text-primary"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Books
                </NavLink>
              </li>
              <li className="transform hover:translate-x-3 transition-transform duration-200 cursor-pointer">
                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary font-semibold"
                      : "text-gray-700 hover:text-primary"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </NavLink>
              </li>

              <div className="pl-6 grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
                {categories.map((category, index) => (
                  <NavLink
                    key={`mobile-category-${index}`}
                    to={category.path}
                    className="text-base text-gray-600 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </NavLink>
                ))}
              </div>
            </ul>

            <div className="mt-auto">
              <div className="py-6 border-t border-gray-200">
                <a
                  href="/auth"
                  className="inline-block py-3 px-6 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition duration-200"
                >
                  Sign In / Register
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
