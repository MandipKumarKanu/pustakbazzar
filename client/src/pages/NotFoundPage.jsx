import React from "react";
import { Link } from "react-router-dom";
import PrimaryBtn from "../components/PrimaryBtn";

const NotFoundPage = () => {
  return (
    <div className="min-h-[85dvh] flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center ">
        <img
          src="/images/notFound.png"
          alt="404 Not Found"
          className="w-full max-w-md mx-auto mb-6 animate-bounce-slow"
        />

        <h1 className="text-4xl font-bold text-primaryColor mb-2">
          Oops! Page Not Found
        </h1>

        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/">
          <PrimaryBtn name="Back to Home" style="mx-auto" />
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
