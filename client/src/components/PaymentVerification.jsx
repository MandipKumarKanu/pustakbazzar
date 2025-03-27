import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineExclamationCircle,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { baseURL, customAxios } from "@/config/axios";
import { useAuthStore } from "@/store/useAuthStore";

function PaymentVerification() {
  const [status, setStatus] = useState("verifying");
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuthStore();

  useEffect(() => {
    if (user) verifyPayment();
  }, [location, navigate, user]);

  const verifyPayment = async () => {
    const params = new URLSearchParams(location.search);
    const pidx = params.get("pidx");
    console.log(pidx);

    if (!pidx) {
      setStatus("error");
      return;
    }

    try {
      const response = await customAxios.post(`${baseURL}khaltipay/verify`, {
        pidx,
      });

      console.log(response);

      const verificationResult =  response.data;

      if (verificationResult.status === "Completed") {
        setStatus("success");

        setTimeout(() => {
          navigate("/order-success");
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
      icon: <AiOutlineLoading3Quarters className="animate-spin" />,
      title: "Verifying Payment",
      message: "Please wait while we confirm your payment...",
      color: "text-blue-500",
    },
    success: {
      icon: <AiOutlineCheckCircle />,
      title: "Payment Successful!",
      message: "Redirecting to order confirmation...",
      color: "text-green-500",
    },
    error: {
      icon: <AiOutlineCloseCircle />,
      title: "Payment Verification Failed",
      message:
        "We couldn't verify your payment. Please try again or contact support.",
      color: "text-red-500",
      action: {
        text: "Return to Cart",
        onClick: () => navigate("/cart"),
      },
    },
    partialError: {
      icon: <AiOutlineExclamationCircle />,
      title: "Order Processing Issue",
      message:
        "Some books in your order are no longer available. Your payment has been processed, but we couldn't complete your order. Please contact support for assistance.",
      color: "text-yellow-500",
      action: {
        text: "Contact Support",
        onClick: () => navigate("/contact-support"),
      },
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className={`text-6xl ${currentStatus.color} mb-6`}>
          {currentStatus.icon}
        </div>
        <h2 className="text-2xl font-semibold mb-4">{currentStatus.title}</h2>
        <p className="text-gray-600 mb-6">{currentStatus.message}</p>
        {currentStatus.action && (
          <button
            onClick={currentStatus.action.onClick}
            className="px-6 py-2 bg-primaryColor text-white rounded-full hover:bg-opacity-90 transition duration-300"
          >
            {currentStatus.action.text}
          </button>
        )}
      </div>
    </div>
  );
}

export default PaymentVerification;
