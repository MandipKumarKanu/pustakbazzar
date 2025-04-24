import React from "react";
import { FaFacebook } from "react-icons/fa6";
import { RiInstagramFill, RiTwitterXFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { CreatedBy } from "./CreatedBy";

const Footer = () => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <footer className="mt-14 bg-gradient-to-b from-purple-900 to-purple-700 text-white z-50 rounded-t-3xl ">
      <div className="flex flex-col md:flex-row justify-between p-8 md:px-32 px-5">
        <div className="flex flex-col mb-6">
          <h1 className="font-semibold text-3xl pb-4">PustakBazzar</h1>
          <div className="flex gap-5">
            <FaFacebook
              size={32}
              className="hover:scale-110 cursor-pointer transition duration-300 ease-in-out"
            />
            <RiInstagramFill
              size={32}
              className="hover:scale-110 cursor-pointer transition duration-300 ease-in-out"
            />
            <RiTwitterXFill
              size={32}
              className="hover:scale-110 cursor-pointer transition duration-300 ease-in-out"
            />
          </div>
        </div>
        <div className="flex flex-col mb-6">
          <h1 className="font-medium text-lg pb-4">All Books</h1>
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Fiction
            </Link>
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Non-Fiction
            </Link>
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Science
            </Link>
          </div>
        </div>
        <div className="flex flex-col mb-6">
          <h1 className="font-medium text-lg pb-4">Company</h1>
          <div className="flex flex-col gap-2">
            {/* Add company-related links here */}
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              About Us
            </Link>
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Careers
            </Link>
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/4 mb-6">
          <h1 className="font-medium text-lg pb-4">Contact Us</h1>
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Birgunj, Parsa, Nepal
            </Link>
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              mandipshah3@gmail.com
            </Link>
            <Link
              to="/"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              +977 980-111-1234
            </Link>

            <div className="flex justify-start">
              <CreatedBy />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-4">
        <p>
          Developed by <span className="font-semibold">Noob Devs</span> | &copy;{" "}
          {new Date().getFullYear()} | All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
