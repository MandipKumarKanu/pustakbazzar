import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Failed
        </h1>

        <p className="text-gray-600 mb-6">
          Your order was not completed because the payment was cancelled or
          failed.
          {orderId && (
            <span className="block mt-2 text-sm text-gray-500">
              Order reference: {orderId}
            </span>
          )}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition duration-300"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="w-full px-4 py-3 bg-white border border-purple-500 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition duration-300"
          >
            Return to Cart
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition duration-300"
          >
            Contact Support
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Having trouble? Our support team is ready to help.
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
