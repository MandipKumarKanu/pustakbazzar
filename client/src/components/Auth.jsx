import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");

  const switchToLogin = () => setActiveTab("login");
  const switchToSignup = () => setActiveTab("signup");

  return (
    <div className="w-full max-w-[600px] m-auto mt-10 px-4">
      <div className="flex justify-around mb-8">
        <div
          className={`p-2 cursor-pointer text-xl font-bold transition-all duration-300 ${
            activeTab === "login"
              ? "text-purple-600 border-b-4 border-purple-600"
              : "text-gray-400 hover:text-purple-400"
          }`}
          onClick={switchToLogin}
        >
          Login
        </div>
        <div
          className={`p-2 cursor-pointer text-xl font-bold transition-all duration-300 ${
            activeTab === "signup"
              ? "text-purple-600 border-b-4 border-purple-600"
              : "text-gray-400 hover:text-purple-400"
          }`}
          onClick={switchToSignup}
        >
          Sign Up
        </div>
      </div>

      {activeTab === "login" ? (
        <Login switchToSignup={switchToSignup} />
      ) : (
        <Signup switchToLogin={switchToLogin} />
      )}
    </div>
  );
};

export default Auth;
