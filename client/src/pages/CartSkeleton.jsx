import React from "react";

const CartSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>

            {[1].map((group) => (
              <div
                key={group}
                className="bg-gray-50 rounded-lg p-4 shadow mb-6 animate-pulse"
              >
                <div className="h-6 w-48 bg-gray-200 rounded mb-4" />

                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex items-center space-x-4 py-4 border-b last:border-b-0"
                  >
                    <div className="h-5 w-5 bg-gray-200 rounded" />

                    <div className="h-28 w-20 bg-gray-200 rounded-md shrink-0" />

                    <div className="flex-grow space-y-2">
                      <div className="h-6 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                      <div className="h-5 w-1/3 bg-gray-200 rounded" />
                    </div>

                    <div className="flex space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded" />
                      <div className="h-8 w-8 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6 border-b-2">
                <div className="h-7 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              <div className="p-6">
                <div className="h-7 w-40 bg-gray-200 rounded mb-6 animate-pulse" />

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 w-28 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="h-10 flex-grow bg-gray-200 rounded-full" />
                  <div className="h-10 w-24 bg-gray-200 rounded-full" />
                </div>

                <div className="flex justify-between mb-6">
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                  <div className="h-6 w-28 bg-gray-200 rounded" />
                </div>

                <div className="h-12 w-full bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
