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
          <Link
            to="/"
            className="font-semibold text-3xl pb-4 hover:text-purple-200 transition-colors"
          >
            PustakBazzar
          </Link>
          <div className="flex gap-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook
                size={32}
                className="hover:scale-110 hover:text-blue-400 cursor-pointer transition duration-300 ease-in-out"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <RiInstagramFill
                size={32}
                className="hover:scale-110 hover:text-pink-400 cursor-pointer transition duration-300 ease-in-out"
              />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <RiTwitterXFill
                size={32}
                className="hover:scale-110 hover:text-sky-400 cursor-pointer transition duration-300 ease-in-out"
              />
            </a>
          </div>
        </div>
        <div className="flex flex-col mb-6">
          <h1 className="font-medium text-lg pb-4">All Books</h1>
          <div className="flex flex-col gap-2">
            <Link
              to="/category/Fiction"
              state={{ value: "fiction" }}
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Fiction
            </Link>
            <Link
              to="/category/Non-Fiction"
              state={{ value: "non-fiction" }}
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Non-Fiction
            </Link>
            <Link
              to="/category/Science"
              state={{ value: "science" }}
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Science
            </Link>
            <Link
              to="/allbooks"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Browse All
            </Link>
          </div>
        </div>
        <div className="flex flex-col mb-6">
          <h1 className="font-medium text-lg pb-4">Company</h1>
          <div className="flex flex-col gap-2">
            <Link
              to="/about-us"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              About Us
            </Link>
            <Link
              to="/terms-and-conditions"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out"
            >
              Contact
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/4 mb-6">
          <h1 className="font-medium text-lg pb-4">Contact Us</h1>
          <div className="flex flex-col gap-2">
            <a
              href="https://maps.google.com/?q=Birgunj,Parsa,Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out flex items-center"
            >
              Birgunj, Parsa, Nepal
            </a>
            <a
              href="mailto:mandipshah3@gmail.com"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out flex items-center"
            >
              mandipshah3@gmail.com
            </a>
            <a
              href="tel:+9779801111234"
              className="hover:translate-x-1 transition-transform duration-300 ease-in-out flex items-center"
            >
              +977 980-111-1234
            </a>

            <div className="flex justify-start mt-3">
              <CreatedBy />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-4 border-t border-purple-600/40">
        <p>
          Developed by{" "}
          <a
            href="https://github.com/noobdevs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
          >
            Noob Devs
          </a>{" "}
          | &copy; {new Date().getFullYear()} | All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
