import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiPackage } from "react-icons/fi";
import { customAxios } from "@/config/axios";

import OrderCard from "../components/orders/OrderCard";
import OrderDetail from "../components/orders/OrderDetail";
import SkeletonBookCard from "@/components/SkeletonBookCard";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await customAxios.get("order/");
        setOrders(response.data.orders);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handlePayNow = (order) => {
    alert(`Initiating payment for Order ${order._id}`);
  };

  return (
    <>
      <div className="container mx-auto px-4 mt-14">
        {loading ? (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-14">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBookCard key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center bg-white rounded-xl p-8 shadow-sm">
            <div className="text-center">
              <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-xl font-medium text-gray-900 mb-2">{error}</p>
              <p className="text-gray-500">Please try refreshing the page</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-lg font-medium"
                onClick={() => window.location.reload()}
              >
                Refresh
              </motion.button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center bg-white rounded-xl p-12 shadow-sm">
            <div className="text-center">
              <FiShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-xl font-medium text-gray-900 mb-2">
                No orders found
              </p>
              <p className="text-gray-500">
                Start shopping to create your first order
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-lg font-medium flex items-center mx-auto"
              >
                <FiShoppingBag className="mr-2" />
                Browse Products
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={setSelectedOrder}
              />
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {selectedOrder && (
            <OrderDetail
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onPayNow={() => handlePayNow(selectedOrder)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MyOrders;
