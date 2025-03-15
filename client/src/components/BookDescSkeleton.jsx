import React from "react";

const BookDescSkeleton = () => {
  return (
    <div className="container mx-auto mt-5 mb-6 px-6 py-8 bg-purple-100 rounded-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div>
          <div className="sticky top-24 w-full h-96 sm:h-[680px] rounded-lg bg-gray-200 animate-pulse" />
        </div>

        <div>
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>

          <div className="flex items-baseline gap-4 mb-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
              <div className="flex space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-36 animate-pulse" />
            </div>
          </div>

          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-24">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="flex items-center mb-3">
                  <div className="w-5 h-5 bg-gray-200 rounded mr-2 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-12 bg-gray-200 rounded w-full mb-3 animate-pulse" />
                <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDescSkeleton;
