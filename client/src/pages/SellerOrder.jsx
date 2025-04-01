import { customAxios } from "@/config/axios";
import React, { useEffect, useState } from "react";
import { Package, User, X, ShoppingBag, Grid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { approveRejectOrder } from "@/api/order";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const OrderDetailsDialog = ({ order, onClose, onAccept, onCancel }) => {
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
        {orderStatus === "pending" && (
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

const SellerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [message, setmessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await customAxios.get("order/seller");
        setOrders(response.data.orders);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleAccept = async () => {
    try {
      await approveRejectOrder(selectedOrder._id, "approved");

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === selectedOrder._id) {
            const updatedOrder = { ...order };
            updatedOrder.orders[0].status = "approved";
            return updatedOrder;
          }
          return order;
        })
      );

      setIsAcceptDialogOpen(false);
      setIsDialogOpen(false);

    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleCancel = async () => {
    try {
      if (!message.trim()) {
        alert("Please provide a reason for cancellation");
        return;
      }

      await approveRejectOrder(selectedOrder._id, "rejected");

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === selectedOrder._id) {
            const updatedOrder = { ...order };
            updatedOrder.orders[0].status = "rejected";
            updatedOrder.orders[0].message = message;
            return updatedOrder;
          }
          return order;
        })
      );

      setIsCancelDialogOpen(false);
      setIsDialogOpen(false);
      setmessage("");

    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.orders[0]?.status === statusFilter);

  const renderTableHeader = () => {
    return (
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-3 text-left">Order ID</th>
          <th className="px-4 py-3 text-left">Date</th>
          <th className="px-4 py-3 text-left">Book</th>
          <th className="px-4 py-3 text-left">Items</th>
          <th className="px-4 py-3 text-left">Amount</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-left">Actions</th>
        </tr>
      </thead>
    );
  };

  const renderTableRow = (order) => {
    const firstBook = order.orders[0]?.books[0]?.bookId;
    const orderStatus = order.orders[0]?.status;
    const totalItems =
      order.orders[0]?.books.reduce(
        (total, book) => total + book.quantity,
        0
      ) || 0;
    const totalAmount =
      (order.orders[0]?.books.reduce(
        (total, book) => total + book.price * book.quantity,
        0
      ) || 0) + order.shippingFee;

    return (
      <tr key={order._id} className="border-b hover:bg-gray-50">
        <td className="px-4 py-3 font-medium">#{order._id.slice(-6)}</td>
        <td className="px-4 py-3 text-sm">{formatDate(order.date)}</td>
        <td className="px-4 py-3">
          {firstBook && (
            <div className="flex items-center space-x-3">
              <img
                src={firstBook.images[0]}
                alt={firstBook.title}
                className="w-10 h-10 object-cover rounded-md"
              />
              <div className="hidden md:block">
                <p className="font-medium text-sm line-clamp-1">
                  {firstBook.title}
                </p>
                <p className="text-xs text-gray-500">by {firstBook.author}</p>
              </div>
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-sm">{totalItems}</td>
        <td className="px-4 py-3 font-medium">₹{totalAmount}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              orderStatus === "pending"
                ? "bg-amber-100 text-amber-800"
                : orderStatus === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {orderStatus &&
              orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetails(order)}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200 transition-colors"
            >
              View
            </button>

            {orderStatus === "pending" && (
              <>
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsAcceptDialogOpen(true);
                  }}
                  className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsCancelDialogOpen(true);
                  }}
                  className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded hover:bg-rose-200 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300">
      <div className="max-w-[1450px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Seller Orders</h1>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-white text-gray-500"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 ${
                  viewMode === "table"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-white text-gray-500"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="w-full">
            <Skeleton height={50} className="mb-2" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={60} className="mb-2" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-rose-600 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-[60dvh] flex justify-center items-center text-center">
            <div>
              <Package className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-xl font-medium">No orders found.</p>
              {statusFilter !== "all" && (
                <p className="text-gray-500 mt-2">
                  Try changing your filter settings
                </p>
              )}
            </div>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto rounded-lg border shadow">
            <table className="w-full">
              {renderTableHeader()}
              <tbody>
                {filteredOrders.map((order) => renderTableRow(order))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => {
              const firstBook = order.orders[0]?.books[0]?.bookId;
              const orderStatus = order.orders[0]?.status;
              const totalItems =
                order.orders[0]?.books.reduce(
                  (total, book) => total + book.quantity,
                  0
                ) || 0;
              const totalAmount =
                (order.orders[0]?.books.reduce(
                  (total, book) => total + book.price * book.quantity,
                  0
                ) || 0) + order.shippingFee;

              return (
                <div
                  key={order._id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">
                        Order #{order._id.slice(-6)}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          orderStatus === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : orderStatus === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {orderStatus &&
                          orderStatus.charAt(0).toUpperCase() +
                            orderStatus.slice(1)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-500">
                        Date: {formatDate(order.date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Items: {totalItems}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Amount: ₹{totalAmount}
                      </p>
                    </div>

                    {firstBook && (
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={firstBook.images[0]}
                          alt={firstBook.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {firstBook.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {firstBook.author}
                          </p>
                        </div>
                      </div>
                    )}

                    {orderStatus === "pending" && (
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsCancelDialogOpen(true);
                          }}
                          className="px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsAcceptDialogOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    )}

                    {orderStatus !== "pending" && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isDialogOpen && selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          onClose={() => setIsDialogOpen(false)}
          onAccept={() => {
            setIsDialogOpen(false);
            setIsAcceptDialogOpen(true);
          }}
          onCancel={() => {
            setIsDialogOpen(false);
            setIsCancelDialogOpen(true);
          }}
        />
      )}

      {isAcceptDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Acceptance</h2>
            <p className="mb-6">Are you sure you want to accept this order?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAcceptDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {isCancelDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Cancel Order</h2>
            <p className="mb-4">Please provide a reason for cancellation:</p>
            <textarea
              className="w-full p-2 border bg-white border-gray-300 rounded-md mb-4"
              rows="3"
              value={message}
              onChange={(e) => setmessage(e.target.value)}
              placeholder="Enter cancellation reason"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCancelDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                disabled={!message.trim()}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrder;
