import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = ({ switchToSignup }) => {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [name, setName] = useLocalStorage("interest", []);


  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const handleGoogleSignIn = async () => {
    try {
      console.log("Google sign-in initiated");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const inputClasses =
    "w-full border-[1px] border-gray-300 px-4 py-3 rounded-3xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white";
  const labelClasses = "block text-gray-700 font-medium mb-2";
  const errorClasses = "text-red-500 text-sm mt-1 ml-2";
  const buttonClasses =
    "w-full px-8 py-3 rounded-3xl bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-xl font-bold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105";

  const onLoginSubmit = async (data) => {
    try {
      console.log(data);
      await login(data.email, data.password, navigate,setName);
      await fetchCart()
      // navigate(-1);
    } catch (err) {
      console.error(err);
    }
  };

  const renderPasswordInput = (
    id,
    registerField,
    error,
    showPassword,
    setShowPassword
  ) => (
    <>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          {...registerField}
          className={`${inputClasses} ${error ? "border-red-500" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error && <p className={errorClasses}>{error.message}</p>}
    </>
  );

  return (
    <form
      onSubmit={handleSubmit(onLoginSubmit)}
      className="flex flex-col gap-6 mt-6 bg-white p-8 rounded-2xl border-2 shadow-xl mb-10"
    >
      <div>
        <label htmlFor="loginEmail" className={labelClasses}>
          Email Address
        </label>
        <input
          id="loginEmail"
          {...register("email")}
          className={`${inputClasses} ${errors.email ? "border-red-500" : ""}`}
          placeholder="Enter your email"
        />
        {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="loginPassword" className={labelClasses}>
          Password
        </label>
        {renderPasswordInput(
          "loginPassword",
          register("password"),
          errors.password,
          showLoginPassword,
          setShowLoginPassword
        )}
      </div>
      <div className="text-sm text-purple-600 cursor-pointer hover:underline font-medium text-right">
        Forgot password?
      </div>
      <button type="submit" className={buttonClasses} disabled={loading}>
        {!loading ? "Login" : "Signing in..."}
      </button>
      <div className="text-sm mt-2 text-center text-gray-600">
        Don't have an account?{" "}
        <span
          className="text-purple-600 cursor-pointer hover:underline font-medium"
          onClick={switchToSignup}
        >
          Sign up
        </span>
      </div>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      <button
        type="button"
        className="flex items-center justify-center gap-3 bg-white text-gray-700 p-3 rounded-3xl hover:bg-gray-50 transition-all duration-300 shadow-md border-2 border-gray-300 font-bold"
        onClick={handleGoogleSignIn}
      >
        <FaGoogle className="text-xl" />
        Login with Google
      </button>
    </form>
  );
};

export default Login;
