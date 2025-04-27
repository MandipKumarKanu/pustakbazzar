import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const formatPhoneNumber = (value) => {
  if (!value) return value;

  const phoneNumber = value.replace(/[^\d]/g, "");

  if (phoneNumber.length < 4) return phoneNumber;
  if (phoneNumber.length < 7) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
};

const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .regex(/^[a-zA-Z]+$/, "First name must contain only letters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .regex(/^[a-zA-Z]+$/, "Last name must contain only letters"),
    userName: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z]+[a-zA-Z0-9]*$/,
        "Username can only contain letters or letters followed by numbers, no spaces or special characters"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .regex(
        /^[a-zA-Z]+[a-zA-Z0-9]*@[a-zA-Z]+\.[a-zA-Z]{2,}$/,
        "Invalid email address (e.g., ram@abc.com or ram12@abc)"
      ),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .refine(
        (val) =>
          /^\d{3}-\d{3}-\d{4}$/.test(val) ||
          /^\d{10}$/.test(val.replace(/\D/g, "")),
        {
          message: "Phone number must be in the format XXX-XXX-XXXX",
        }
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const Signup = ({ switchToLogin }) => {
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] =
    useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  const navigate = useNavigate();
  const { signUp, loading } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const handleGoogleSignIn = async () => {
    try {
      console.log("Google sign-up initiated");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhoneValue(formattedPhoneNumber);
    setValue("phoneNumber", formattedPhoneNumber, { shouldValidate: true });
  };

  const inputClasses =
    "w-full border-[1px] border-gray-300 px-3 py-2 rounded-3xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white";
  const labelClasses = "block text-gray-700 font-medium mb-1 text-sm";
  const errorClasses = "text-red-500 text-xs mt-1 ml-2";
  const buttonClasses =
    "w-full px-6 py-2 rounded-3xl bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-lg font-bold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105";

  const onSignupSubmit = async (formData) => {
    try {
      const dataToSend = {
        profile: {
          userName: formData.userName,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        },
        password: formData.password,
      };

      signUp(dataToSend, navigate);

      console.log("Submitting data:", dataToSend);

      // reset();
      // switchToLogin();
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
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>
      {error && <p className={errorClasses}>{error.message}</p>}
    </>
  );

  // Spinner component for the loading animation
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <form
      onSubmit={handleSubmit(onSignupSubmit)}
      className="flex flex-col gap-3 mt-4 bg-white p-6 rounded-2xl border-2 shadow-xl mb-6"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className={labelClasses}>
            First Name
          </label>
          <input
            id="firstName"
            {...register("firstName")}
            className={`${inputClasses} ${
              errors.firstName ? "border-red-500" : ""
            }`}
            placeholder="First name"
          />
          {errors.firstName && (
            <p className={errorClasses}>{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClasses}>
            Last Name
          </label>
          <input
            id="lastName"
            {...register("lastName")}
            className={`${inputClasses} ${
              errors.lastName ? "border-red-500" : ""
            }`}
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className={errorClasses}>{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="userName" className={labelClasses}>
          Username
        </label>
        <input
          id="userName"
          {...register("userName")}
          className={`${inputClasses} ${
            errors.userName ? "border-red-500" : ""
          }`}
          placeholder="Username"
        />
        {errors.userName && (
          <p className={errorClasses}>{errors.userName.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="signupEmail" className={labelClasses}>
            Email Address
          </label>
          <input
            id="signupEmail"
            type="email"
            {...register("email")}
            className={`${inputClasses} ${
              errors.email ? "border-red-500" : ""
            }`}
            placeholder="Email"
          />
          {errors.email && (
            <p className={errorClasses}>{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="phoneNumber" className={labelClasses}>
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneValue}
            onChange={handlePhoneChange}
            className={`${inputClasses} ${
              errors.phoneNumber ? "border-red-500" : ""
            }`}
            placeholder="XXX-XXX-XXXX"
          />
          {errors.phoneNumber && (
            <p className={errorClasses}>{errors.phoneNumber.message}</p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="signupPassword" className={labelClasses}>
          Password
        </label>
        {renderPasswordInput(
          "signupPassword",
          register("password"),
          errors.password,
          showSignupPassword,
          setShowSignupPassword
        )}
      </div>
      <div>
        <label htmlFor="signupConfirmPassword" className={labelClasses}>
          Confirm Password
        </label>
        {renderPasswordInput(
          "signupConfirmPassword",
          register("confirmPassword"),
          errors.confirmPassword,
          showSignupConfirmPassword,
          setShowSignupConfirmPassword
        )}
      </div>
      <button
        type="submit"
        className={`${buttonClasses} mt-2 ${
          loading ? "cursor-not-allowed opacity-90" : ""
        } flex items-center justify-center`}
        disabled={loading}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span>Creating Account...</span>
          </>
        ) : (
          "Create Account"
        )}
      </button>
      <div className="text-xs mt-2 text-center text-gray-600">
        Already have an account?{" "}
        <span
          className="text-purple-600 cursor-pointer hover:underline font-medium"
          onClick={switchToLogin}
        >
          Login
        </span>
      </div>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      <button
        type="button"
        className="flex items-center justify-center gap-2 bg-white text-gray-700 p-2 rounded-3xl hover:bg-gray-50 transition-all duration-300 shadow-md border-2 border-gray-300 font-bold"
        onClick={handleGoogleSignIn}
      >
        <FaGoogle size={14} />
        <span className="text-sm">Sign up with Google</span>
      </button>
    </form>
  );
};

export default Signup;
