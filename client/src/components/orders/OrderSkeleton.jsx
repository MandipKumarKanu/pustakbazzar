import React from "react";

const OrderSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <div className="h-48 bg-gray-100 animate-pulse" />
          <div className="p-5">
            <div className="h-6 bg-gray-100 rounded w-1/2 mb-3 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4 animate-pulse" />
            <div className="flex space-x-2 mb-4">
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
            </div>
            <div className="flex justify-between items-center pt-3">
              <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default OrderSkeleton;