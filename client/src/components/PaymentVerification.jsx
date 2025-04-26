import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiCreditCard,
  FiArrowLeft,
} from "react-icons/fi";
import { baseURL, customAxios } from "@/config/axios";
import { useAuthStore } from "@/store/useAuthStore";

function PaymentVerification() {
  const [status, setStatus] = useState("verifying");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    if (status === "verifying") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const params = new URLSearchParams(location.search);
    const pidx = params.get("pidx");

    if (!pidx) {
      setStatus("error");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await customAxios.post(`${baseURL}khaltipay/verify`, {
        pidx,
      });

      const verificationResult = response.data;

      if (verificationResult.status === "Completed") {
        setStatus("success");
        setProgress(100);

        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } else {
        throw new Error("Payment was not completed");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      setStatus("error");
    }
  };

  const statusConfig = {
    verifying: {
      icon: <FiLoader className="animate-spin" />,
      title: "Verifying Your Payment",
      message: "Please wait while we confirm your transaction...",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    success: {
      icon: <FiCheckCircle />,
      title: "Payment Successful!",
      message: "Your order has been processed. Redirecting to your orders...",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    error: {
      icon: <FiAlertCircle />,
      title: "Payment Verification Failed",
      message:
        "We couldn't verify your payment. Please try again or contact our support team for assistance.",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      action: {
        primary: {
          text: "Try Again",
          onClick: () => navigate("/cart"),
          icon: <FiCreditCard className="mr-2" />,
        },
        secondary: {
          text: "Return to Cart",
          onClick: () => navigate("/cart"),
          icon: <FiArrowLeft className="mr-2" />,
        },
      },
    },
    partialError: {
      icon: <FiAlertCircle />,
      title: "Order Processing Issue",
      message:
        "We processed your payment, but there was an issue with some items in your order. Please contact customer support for assistance.",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      action: {
        primary: {
          text: "View Order Details",
          onClick: () => navigate("/profile"),
        },
        secondary: {
          text: "Contact Support",
          onClick: () => navigate("/contact"),
        },
      },
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-t-4 ${currentStatus.borderColor} transition-all duration-300`}
      >
        <div
          className={`relative inline-flex p-6 rounded-full ${currentStatus.bgColor} mb-6`}
        >
          <span className={`text-5xl ${currentStatus.color}`}>
            {currentStatus.icon}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-gray-800">
          {currentStatus.title}
        </h2>
        <p className="text-gray-600 mb-6">{currentStatus.message}</p>

        {status === "verifying" && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-primaryColor to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {status === "success" && (
          <div className="animate-pulse py-4 px-6 bg-green-50 rounded-lg text-green-800 text-sm mb-6">
            Redirecting you to your orders...
          </div>
        )}

        {currentStatus.action && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {currentStatus.action.primary && (
              <button
                onClick={currentStatus.action.primary.onClick}
                className="flex-1 px-6 py-3 bg-gradient-to-t from-primaryColor to-secondaryColor text-white rounded-xl hover:bg-opacity-90 transition duration-300 flex items-center justify-center font-medium"
              >
                {currentStatus.action.primary.icon}
                {currentStatus.action.primary.text}
              </button>
            )}

            {currentStatus.action.secondary && (
              <button
                onClick={currentStatus.action.secondary.onClick}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-300 flex items-center justify-center font-medium"
              >
                {currentStatus.action.secondary.icon}
                {currentStatus.action.secondary.text}
              </button>
            )}
          </div>
        )}
      </div>

      {status === "success" && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 max-w-md w-full animate-fadeIn">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
            Order Summary
          </h3>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between py-1">
              <span>Order ID:</span>
              <span className="font-medium text-gray-800">
                #ORD{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>Payment Method:</span>
              <span className="font-medium text-gray-800">Khalti</span>
            </div>
            <div className="flex justify-between py-1 border-t mt-1 pt-2">
              <span>Estimated Delivery:</span>
              <span className="font-medium text-gray-800">
                {new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(
                  Date.now() + 10 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {(status === "error" || status === "partialError") && (
        <div className="mt-6 text-center text-gray-500 text-sm max-w-md">
          <p>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@pustakbazzar.com"
              className="text-primaryColor hover:underline"
            >
              support@pustakbazzar.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default PaymentVerification;
