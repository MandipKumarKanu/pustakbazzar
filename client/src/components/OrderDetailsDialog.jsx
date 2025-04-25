import { formatDate } from "@/hooks/helper";
import { Package, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";

export const OrderDetailsDialog = ({
  order,
  onClose,
  onAccept,
  onCancel,
  seeBelow = true,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const orderDetails = order.orders[0];
  const orderStatus = orderDetails?.status;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg flex items-center space-x-2 ${
        activeTab === id
          ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const totalAmount =
    orderDetails?.books.reduce(
      (acc, book) => acc + book.price * book.quantity,
      0
    ) + order.shippingFee;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Order #{order._id.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="border-b">
          <div className="flex px-6">
            <TabButton id="details" label="Order Details" icon={Package} />
            <TabButton id="products" label="Books" icon={ShoppingBag} />
            <TabButton id="customer" label="Customer Info" icon={User} />
          </div>
        </div>
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    orderStatus === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : orderStatus === "rejected"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {orderStatus &&
                    orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                </span>
              </div>
              {orderDetails?.message && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reason:</span>
                  <span className="text-rose-800 capitalize line-clamp-2">
                    {orderDetails.message}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(order.date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">
                  {order.khaltiPaymentId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping Fee:</span>
                <span className="font-semibold">₹{order.shippingFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Items:</span>
                <span>
                  {orderDetails?.books.reduce(
                    (acc, book) => acc + book.quantity,
                    0
                  )}
                </span>
              </div>
            </div>
          )}
          {activeTab === "products" && (
            <div className="space-y-4">
              {orderDetails?.books.map((book, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                >
                  <img
                    src={book.bookId.images[0]}
                    alt={book.bookId.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-grow">
                    <p className="font-medium">{book.bookId.title}</p>
                    <p className="text-sm text-gray-600">
                      by {book.bookId.author}
                    </p>
                    <div className="flex justify-between mt-1">
                      <p className="text-gray-600">Quantity: {book.quantity}</p>
                      <p className="text-gray-800 font-medium">
                        ₹ {book.price}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Seller Earnings: ₹{book.sellerEarnings}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "customer" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Name:</span>
                <span>{`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span>{order.shippingAddress.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phone:</span>
                <span>{order.shippingAddress.phone}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p className="text-gray-700">
                  {order.shippingAddress.street}, {order.shippingAddress.town}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress.province}
                </p>
                <p className="text-gray-700">
                  Near: {order.shippingAddress.landmark}
                </p>
              </div>
            </div>
          )}
        </div>
        {seeBelow && orderStatus === "pending" && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => onAccept(order)}
                className="bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Accept Order
              </button>
              <button
                onClick={() => onCancel(order)}
                className="bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors"
              >
                Cancel Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
