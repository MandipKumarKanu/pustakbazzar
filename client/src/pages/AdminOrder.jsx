import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/hooks/helper";
import { OrderDetailsDialog } from "@/components/OrderDetailsDialog";
import { getOrderForAdmin, updateOrderStatusApi } from "@/api/order";
import DataTable from "@/components/reactTable";
import { adminOrderColumns } from "@/components/adminOrderColumns";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrderForAdmin();
      setOrders(response.data.orders);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders. Please try again later.");
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.orderStatus || "pending");
    setIsStatusDialogOpen(true);
    fetchOrders();
  };

  const updateOrderStatus = async () => {
    try {
      await updateOrderStatusApi(selectedOrder._id, selectedStatus);
      fetchOrders();
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.orderStatus === statusFilter);

  const renderTableHeader = () => {
    return (
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-3 text-left">Order ID</th>
          <th className="px-4 py-3 text-left">Date</th>
          <th className="px-4 py-3 text-left">Book</th>
          <th className="px-4 py-3 text-left">Customer</th>
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
    const orderStatus = order.orderStatus;
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
        <td className="px-4 py-3 text-sm">
          <p className="font-medium">
            {order?.userId?.profile?.userName || "N/A"}
          </p>
          <p className="text-xs text-gray-500">
            {order?.userId?.profile?.email || "N/A"}
          </p>
        </td>
        <td className="px-4 py-3 text-sm">{totalItems}</td>
        <td className="px-4 py-3 font-medium">₹{totalAmount}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 text-xs capitalize rounded-full ${
              orderStatus === "pending"
                ? "bg-amber-100 text-amber-800"
                : orderStatus === "shipped"
                ? "bg-blue-100 text-blue-800"
                : orderStatus === "delivered"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {orderStatus}
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
            <button
              onClick={() => handleStatusChange(order)}
              className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200 transition-colors"
            >
              Update Status
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300">
      <div className="max-w-[1450px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Orders</h1>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
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
        ) : filteredOrders && filteredOrders.length === 0 ? (
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
        ) : (
          <div className="overflow-x-auto rounded-lg border shadow">
            {/* <table className="w-full">
              {renderTableHeader()}
              <tbody>
                {filteredOrders &&
                  filteredOrders.map((order) => renderTableRow(order))}
              </tbody>
            </table> */}

            <DataTable
              columns={adminOrderColumns(handleViewDetails, handleStatusChange)}
              data={filteredOrders}
              rowClassName={(row) => {
                const status = row.orderStatus;
                return status === "pending"
                  ? "bg-yellow-50"
                  : status === "shipped"
                  ? "bg-blue-50"
                  : status === "delivered"
                  ? "bg-green-50"
                  : "";
              }}
            />
          </div>
        )}
      </div>

      {isDialogOpen && selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          onClose={() => setIsDialogOpen(false)}
          onUpdateStatus={() => {
            setIsDialogOpen(false);
            handleStatusChange(selectedOrder);
          }}
          seeBelow={false}
        />
      )}

      {isStatusDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
            <p className="mb-4">Order ID: #{selectedOrder._id.slice(-6)}</p>

            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Status:
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsStatusDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={updateOrderStatus}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrder;
