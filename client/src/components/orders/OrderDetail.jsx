import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
  FiPrinter, // Add this import
} from "react-icons/fi";
import StatusBadge from "./StatusBadge";

const OrderDetail = ({ order, onClose, onPayNow }) => {
  const dialogRef = useRef(null);
  const printRef = useRef(null); // Add this ref for print content

  useEffect(() => {
    // When component mounts, show dialog
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }

    // Prevent scrolling on background content
    document.body.style.overflow = "hidden";

    // Clean up when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    // Close the dialog properly
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose();
  };

  // Handle clicking outside the dialog content
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  // Add print function
  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    
    // Generate the books table HTML
    const booksTableHTML = order.orders.flatMap((sellerOrder) =>
      sellerOrder.books.map((item) => `
        <tr>
          <td>${item.bookId.title}</td>
          <td>${item.bookId.author}</td>
          <td>₹${parseFloat(item.price).toFixed(2)}</td>
          <td>${Number(item.quantity)}</td>
          <td>₹${(parseFloat(item.price) * Number(item.quantity)).toFixed(2)}</td>
        </tr>
      `).join('')
    ).join('');

    // Generate landmark HTML if it exists
    const landmarkHTML = order.shippingAddress.landmark ? `
      <div class="address-item">
        <span class="address-label">Landmark:</span>
        ${order.shippingAddress.landmark}
      </div>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - Order #${order._id.slice(-8)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .invoice-header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .order-id {
              font-size: 16px;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #333;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .info-value {
              font-weight: bold;
              color: #333;
            }
            .books-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .books-table th,
            .books-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .books-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .address-section {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .address-item {
              margin-bottom: 10px;
            }
            .address-label {
              font-weight: bold;
              color: #666;
              display: inline-block;
              width: 80px;
            }
            .summary-section {
              background: #333;
              color: white;
              padding: 20px;
              border-radius: 8px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .summary-label {
              flex: 1;
            }
            .summary-value {
              font-weight: bold;
            }
            .total-row {
              border-top: 1px solid #666;
              padding-top: 10px;
              margin-top: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-processing { background: #dbeafe; color: #1e40af; }
            .status-shipped { background: #d1fae5; color: #065f46; }
            .status-delivered { background: #d1fae5; color: #065f46; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .status-paid { background: #d1fae5; color: #065f46; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="invoice-title">INVOICE</div>
            <div class="order-id">Order #${order._id.slice(-8)}</div>
          </div>

          <div class="section">
            <div class="section-title">Order Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${formattedDate}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge status-${order.orderStatus.toLowerCase()}">${order.orderStatus}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${order.payment}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment Status</div>
                <div class="info-value">
                  <span class="status-badge status-${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Books Ordered</div>
            <table class="books-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${booksTableHTML}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <div class="address-section">
              <div class="address-item">
                <span class="address-label">Name:</span>
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}
              </div>
              <div class="address-item">
                <span class="address-label">Address:</span>
                ${order.shippingAddress.street}, ${order.shippingAddress.town}, ${order.shippingAddress.province}
              </div>
              <div class="address-item">
                <span class="address-label">Phone:</span>
                ${order.shippingAddress.phone}
              </div>
              <div class="address-item">
                <span class="address-label">Email:</span>
                ${order.shippingAddress.email}
              </div>
              ${landmarkHTML}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Summary</div>
            <div class="summary-section">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">₹${parseFloat(order.totalPrice).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Shipping Fee</span>
                <span class="summary-value">₹${parseFloat(order.shippingFee).toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Discount</span>
                <span class="summary-value">-₹${parseFloat(order.discount).toFixed(2)}</span>
              </div>
              <div class="summary-row total-row">
                <span class="summary-label">Total</span>
                <span class="summary-value">₹${parseFloat(order.netTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const renderShippingAddress = () => {
    const { shippingAddress } = order;
    return (
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <FiUser className="mr-3 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{`${shippingAddress.firstName} ${shippingAddress.lastName}`}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FiMapPin className="mr-3 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{`${shippingAddress.town}, ${shippingAddress.province}`}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FiPhone className="mr-3 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{shippingAddress.phone}</p>
            </div>
          </div>

          <div className="flex items-start">
            <FiMail className="mr-3 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{shippingAddress.email}</p>
            </div>
          </div>

          {shippingAddress.landmark && (
            <div className="flex items-start">
              <div className="w-5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Landmark</p>
                <p className="font-medium">{shippingAddress.landmark}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const formattedDate = new Date(order.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper function to get status badge class for print
  const getStatusClass = (status, type = 'order') => {
    const statusLower = status.toLowerCase();
    return `status-badge status-${statusLower}`;
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 w-full bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm p-4 z-50 m-0 outline-none overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative text-black shadow-2xl mx-auto my-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Order #{order._id.slice(-8)}
          </h2>

          <div className="flex items-center gap-3">
            {/* Add Print Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrintInvoice}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <FiPrinter size={16} />
              Print Invoice
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 cursor-pointer"
            >
              <FiX size={20} />
            </motion.button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Original content remains the same */}
          <div className="mb-8">
            <div className="flex flex-wrap -mx-2">
              <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 h-full hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <div className="flex items-center mb-2 text-gray-500">
                    <FiCalendar className="mr-2" size={16} />
                    <p className="text-sm font-medium">Date</p>
                  </div>
                  <p className="font-medium text-gray-800 truncate">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 h-full hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <div className="flex items-center mb-2 text-gray-500">
                    <FiClock className="mr-2" size={16} />
                    <p className="text-sm font-medium">Status</p>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                </div>
              </div>

              <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 h-full hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <div className="flex items-center mb-2 text-gray-500">
                    <FiCreditCard className="mr-2" size={16} />
                    <p className="text-sm font-medium">Payment Method</p>
                  </div>
                  <div className="flex items-center">
                    <span className="capitalize font-medium text-gray-800">
                      {order.payment}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 h-full hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <div className="flex items-center mb-2 text-gray-500">
                    <FiCreditCard className="mr-2" size={16} />
                    <p className="text-sm font-medium">Payment Status</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.paymentStatus} type="payment" />

                    {order.paymentStatus === "pending" && (
                      <motion.button
                        onClick={onPayNow}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white text-xs px-4 py-1.5 rounded-lg font-medium shadow-sm"
                      >
                        Pay Now
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Books</h3>
              <div className="ml-3 px-3 py-1 bg-gray-100 rounded-full text-sm">
                {order.orders.reduce(
                  (total, sellerOrder) =>
                    total +
                    sellerOrder.books.reduce(
                      (bookTotal, book) => bookTotal + book.quantity,
                      0
                    ),
                  0
                )}{" "}
                items
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl overflow-hidden">
              {order.orders.flatMap((sellerOrder) =>
                sellerOrder.books.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="flex justify-between items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-white rounded-lg mr-4 p-1 flex items-center justify-center">
                        <img
                          src={item.bookId.images[0]}
                          alt={item.bookId.title}
                          className="max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block mb-1">
                          {item.bookId.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          by {item.bookId.author}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {Number(item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Shipping Address
            </h3>
            {renderShippingAddress()}
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Subtotal</span>
                <span className="font-medium">
                  ₹{parseFloat(order.totalPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Shipping Fee</span>
                <span className="font-medium">
                  ₹{parseFloat(order.shippingFee).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Discount</span>
                <span className="font-medium text-green-400">
                  -₹{parseFloat(order.discount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-700">
                <span>Total</span>
                <span>₹{parseFloat(order.netTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </dialog>
  );
};

export default OrderDetail;
