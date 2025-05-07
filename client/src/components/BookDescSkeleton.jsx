import React from "react";

const BookDescSkeleton = () => {
  return (
    <div className="flex  bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <span className="mx-2">/</span>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <span className="mx-2">/</span>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            <div className="p-6 md:p-8 bg-white border-b md:border-b-0 md:border-r border-gray-100">
              <div className="sticky top-24 space-y-6">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />

                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-16 h-20 rounded-md overflow-hidden snap-start bg-gray-200 animate-pulse"
                    />
                  ))}
                </div>

                <div className="flex justify-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 lg:col-span-2">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-6 w-40 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex gap-2 flex-wrap">
                      <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-4 mb-4">
                    <div className="flex flex-col">
                      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
                  </div>

                  <div className="mb-6">
                    <div className="flex border-b border-gray-200">
                      <div className="py-3 px-4 h-10 w-24 bg-gray-200 rounded animate-pulse mr-2" />
                      <div className="py-3 px-4 h-10 w-24 bg-gray-200 rounded animate-pulse mr-2" />
                      <div className="py-3 px-4 h-10 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="pt-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <div className="space-y-3">
                      <div className="h-12 w-full bg-gray-200 rounded-3xl animate-pulse" />
                      <div className="h-12 w-full bg-gray-200 rounded-3xl animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDescSkeleton;
