import { customAxios } from "@/config/axios";
import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { approveRejectOrder } from "@/api/order";
import { OrderDetailsDialog } from "@/components/OrderDetailsDialog";
import { formatDate } from "@/hooks/helper";
import DataTable from "@/components/reactTable";

const SellerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await customAxios.get("order/seller");
        const transformedOrders = response.data.orders.map((order) => ({
          ...order,
          orderStatus: order.orders[0]?.status || "unknown",
        }));
        setOrders(transformedOrders);
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

      setIsCancelDialogOpen(false);
      setIsDialogOpen(false);
      setMessage("");
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.orderStatus === statusFilter);

  const sellerOrderColumns = [
    {
      header: "Order ID",
      accessorKey: "_id",
      cell: ({ row }) => (
        <span className="font-medium">#{row.original._id.slice(-6)}</span>
      ),
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      header: "Book",
      accessorKey: "orders",
      cell: ({ row }) => {
        const book = row.original.orders[0]?.books[0]?.bookId;
        return book ? (
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
        ) : null;
      },
    },
    {
      header: "Items",
      accessorKey: "itemCount",
      cell: ({ row }) =>
        row.original.orders[0]?.books.reduce((acc, b) => acc + b.quantity, 0) ||
        0,
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      cell: ({ row }) => {
        const books = row.original.orders[0]?.books || [];
        const bookAmount = books.reduce(
          (sum, b) => sum + b.price * b.quantity,
          0
        );
        return (
          <span className="font-medium">
            ₹{bookAmount + row.original.shippingFee}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "orderStatus",
      cell: ({ row }) => {
        const status = row.original.orderStatus;
        const colorClass =
          status === "pending"
            ? "bg-amber-100 text-amber-800"
            : status === "approved"
            ? "bg-emerald-100 text-emerald-800"
            : status === "rejected"
            ? "bg-rose-100 text-rose-800"
            : "bg-gray-100 text-gray-800";

        return (
          <span
            className={`px-2 py-1 text-xs capitalize rounded-full ${colorClass}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => {
        const status = row.original.orderStatus;
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetails(row.original)}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200 transition-colors"
            >
              View
            </button>

            {status === "pending" && (
              <>
                <button
                  onClick={() => handleAcceptClick(row.original)}
                  className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded hover:bg-emerald-200 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleCancelClick(row.original)}
                  className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded hover:bg-rose-200 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const getRowClassName = (row) => {
    const status = row.original.orderStatus;
    return status === "pending"
      ? "bg-amber-50"
      : status === "approved"
      ? "bg-emerald-50"
      : status === "rejected"
      ? "bg-rose-50"
      : "";
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
            <DataTable
              columns={sellerOrderColumns}
              data={filteredOrders || []}
              getRowClassName={getRowClassName}
            />
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
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Reason for cancellation..."
            />
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
