import { customAxios } from "@/config/axios";
import React, { useEffect, useState, useCallback } from "react";
import {
  Package,
  User,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { approveRejectOrder } from "@/api/order";
import { OrderDetailsDialog } from "@/components/OrderDetailsDialog";
import { formatDate } from "@/hooks/helper";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { FiCheck, FiX } from "react-icons/fi";

const SellerOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "pending"
  );

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", statusFilter);
    params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [statusFilter, currentPage, setSearchParams]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await customAxios.get(
        `order/seller?status=${statusFilter}&page=${currentPage}&limit=${limit}`
      );

      const transformedOrders = response.data.orders.map((order) => ({
        ...order,
        orderStatus: order.orders[0]?.status || "unknown",
      }));

      setOrders(transformedOrders);

      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleAcceptClick = (order) => {
    setSelectedOrder(order);
    setIsAcceptDialogOpen(true);
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setIsCancelDialogOpen(true);
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      await approveRejectOrder(selectedOrder._id, "approved");

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === selectedOrder._id) {
            return {
              ...order,
              orderStatus: "approved",
              orders: order.orders.map((o, idx) =>
                idx === 0 ? { ...o, status: "approved" } : o
              ),
            };
          }
          return order;
        })
      );

      toast.success("Order accepted successfully!");

      if (statusFilter === "pending") {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Failed to accept order. Please try again.");
    } finally {
      setIsAcceptDialogOpen(false);
      setIsDialogOpen(false);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      if (!message.trim()) {
        toast.error("Please provide a reason for cancellation");
        return;
      }

      setLoading(true);
      await approveRejectOrder(selectedOrder._id, "rejected", message);

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === selectedOrder._id) {
            return {
              ...order,
              orderStatus: "rejected",
              orders: order.orders.map((o, idx) =>
                idx === 0 ? { ...o, status: "rejected", message } : o
              ),
            };
          }
          return order;
        })
      );

      toast.success("Order cancelled successfully");

      if (statusFilter === "pending") {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setIsCancelDialogOpen(false);
      setIsDialogOpen(false);
      setMessage("");
      setLoading(false);
    }
  };

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
    const status = order.orderStatus;
    const book = order.orders[0]?.books[0]?.bookId;
    const books = order.orders[0]?.books || [];
    const bookAmount = books.reduce((sum, b) => sum + b.price * b.quantity, 0);
    const itemCount = books.reduce((acc, b) => acc + b.quantity, 0) || 0;

    return (
      <tr key={order._id} className="border-b hover:bg-gray-50">
        <td className="px-4 py-3 font-medium">#{order._id.slice(-6)}</td>
        <td className="px-4 py-3 text-sm">{formatDate(order.date)}</td>
        <td className="px-4 py-3">
          {book && (
            <div className="flex items-center space-x-3">
              <img
                src={book.images[0]}
                alt={book.title}
                className="w-10 h-10 object-cover rounded-md"
              />
              <div className="hidden md:block">
                <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-500">by {book.author}</p>
              </div>
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-sm">{itemCount}</td>
        <td className="px-4 py-3 font-medium">
          ₹{bookAmount + order.shippingFee}
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              status === "pending"
                ? "bg-amber-100 text-amber-800"
                : status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
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

            {status === "pending" && (
              <>
                <button
                  onClick={() => handleAcceptClick(order)}
                  className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleCancelClick(order)}
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

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center mt-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300 bg-gray-50">
      <div className="max-w-[1450px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Seller Orders</h1>

          <div className="flex items-center space-x-4 self-end">
            <Tabs
              defaultValue="pending"
              value={statusFilter}
              onValueChange={handleStatusChange}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>

            <button
              onClick={fetchOrders}
              className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
              title="Refresh orders"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="w-full bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <Skeleton height={30} width={200} />
              <Skeleton height={30} width={120} />
            </div>
            <Skeleton height={50} className="mb-2" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={60} className="mb-2" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border p-8 shadow-sm text-center">
            <div className="text-rose-500 mb-4">
              <X size={48} className="mx-auto" />
            </div>
            <p className="text-rose-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="h-[60dvh] flex justify-center items-center text-center bg-white rounded-lg border shadow-sm">
            <div>
              <ShoppingBag className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <p className="text-xl font-medium">No orders found</p>
              {statusFilter !== "all" && (
                <p className="text-gray-500 mt-2 mb-4">
                  No {statusFilter} orders available
                </p>
              )}
              <button
                onClick={() => handleStatusChange("all")}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                View All Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border shadow bg-white">
            <table className="w-full">
              {renderTableHeader()}
              <tbody>{orders.map((order) => renderTableRow(order))}</tbody>
            </table>
          </div>
        )}

        <Pagination />
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
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold mb-2">Accept Order</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to accept this order?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsAcceptDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Processing...
                  </span>
                ) : (
                  "Accept"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCancelDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-lg p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold mb-2">Cancel Order</h2>
            <p className="mb-4 text-gray-600">
              Please provide a reason for cancellation:
            </p>
            <textarea
              className="w-full p-3 border bg-white border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter reason for cancellation..."
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCancelDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:opacity-80 transition-opacity"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!message.trim() || loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Processing...
                  </span>
                ) : (
                  "Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrder;
