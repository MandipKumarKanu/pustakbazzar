import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { customAxios } from "@/config/axios";
import { toast } from "sonner";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { data } = await customAxios.post("/auth/forgot-password", {
        email,
      });

      setError("");
      toast.success("Reset code sent successfully!");
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send reset code");
      toast.error(error.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;

    if (value.length > 1) {
      const chars = value.split("");
      const newOtp = [...otp];

      chars.forEach((char, charIndex) => {
        if (index + charIndex < 6) {
          newOtp[index + charIndex] = char;
        }
      });

      setOtp(newOtp);

      const nextIndex = Math.min(index + chars.length, 5);
      if (nextIndex < 6) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete reset code");
      return;
    }

    setLoading(true);
    try {
      const { data } = await customAxios.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });

      setError("");
      toast.success("Code verified successfully!");
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to verify reset code");
      toast.error(
        error.response?.data?.message || "Failed to verify reset code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password) {
      setError("Please enter a new password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const otpString = otp.join("");
      const { data } = await customAxios.post("/auth/reset-password", {
        email,
        otp: otpString,
        password,
      });

      setError("");
      toast.success("Password has been reset successfully!");
      navigate("/auth");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password");
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { data } = await customAxios.post("/auth/resend-otp", { email });
      toast.success("New verification code sent!");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send new code");
      toast.error(error.response?.data?.message || "Failed to send new code");
    } finally {
      setLoading(false);
    }
  };

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

  const inputClasses =
    "w-full border-[1px] border-gray-300 px-4 py-3 rounded-3xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white";
  const labelClasses = "block text-gray-700 font-medium mb-2";
  const errorClasses = "text-red-500 text-sm mt-1 ml-2";
  const buttonClasses =
    "w-full px-6 py-3 rounded-3xl bg-gradient-to-t from-primaryColor to-secondaryColor text-white text-xl font-bold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105";

  return (
    <div className="min-h-[82dvh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border-2">
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className={`${buttonClasses} ${
                    loading ? "cursor-not-allowed opacity-90" : ""
                  } flex items-center justify-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Sending code...</span>
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </button>
              </div>

              <div className="text-sm text-center">
                <Link
                  to="/auth"
                  className="text-purple-600 cursor-pointer hover:underline font-medium"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label
                  htmlFor="otp"
                  className={`${labelClasses} text-center block mb-3`}
                >
                  Enter the 6-digit code sent to <br />
                  <span className="font-bold">{email}</span>
                </label>
                <div className="flex justify-center space-x-2 sm:space-x-3">
                  {otp.map((digit, index) => (
                    <React.Fragment key={index}>
                      <input
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-10 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {index === 2 && (
                        <span className="self-center text-gray-500 font-bold">
                          -
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className={`${buttonClasses} ${
                    loading ? "cursor-not-allowed opacity-90" : ""
                  } flex items-center justify-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-purple-600 cursor-pointer hover:underline font-medium"
                  >
                    Change email
                  </button>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-purple-600 cursor-pointer hover:underline font-medium"
                    disabled={loading}
                  >
                    Resend code
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="password" className={labelClasses}>
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClasses}>
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className={`${buttonClasses} ${
                    loading ? "cursor-not-allowed opacity-90" : ""
                  } flex items-center justify-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>Resetting password...</span>
                    </>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
