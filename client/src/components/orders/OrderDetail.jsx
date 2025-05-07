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
} from "react-icons/fi";
import StatusBadge from "./StatusBadge";

const OrderDetail = ({ order, onClose, onPayNow }) => {
  const dialogRef = useRef(null);

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

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 w-full bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm p-4 z-50 m-0 outline-none  overflow-hidden"
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

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200 cursor-pointer"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
