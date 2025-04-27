import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { getLatestDonation } from "@/api/donation";
import DonaterCard from "./DonaterCard";
import { FaUser, FaBookOpen, FaAward } from "react-icons/fa";

function DonationSection() {
  const [donationData, setDonationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getLatestDonation();
        setDonationData(res.data.donations);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const DonaterCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl w-full mx-auto border border-gray-100 flex flex-col sm:flex-row">
      <div className="relative w-full sm:w-1/3 sm:min-h-full">
        <div className="absolute top-2 right-3 bg-gray-200 animate-pulse text-transparent text-[10px] px-3 py-1 rounded-full z-20">
          Badge
        </div>

        <div className="h-40 sm:h-full w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="w-24 h-24 bg-gray-200 animate-pulse rounded-full flex items-center justify-center">
            <FaUser className="text-gray-300 text-4xl" />
          </div>
        </div>
      </div>

      <div className="w-full sm:w-2/3 flex flex-col justify-between p-0">
        <div className="px-5 py-4">
          <div className="flex items-center">
            <Skeleton className="h-6 w-36 rounded" />
            <div className="ml-2 text-gray-200">
              <FaAward />
            </div>
          </div>

          <div className="flex items-center mt-2">
            <Skeleton className="h-5 w-28 mr-2 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-start">
              <div className="mt-1 mr-2 text-gray-200">
                <FaBookOpen />
              </div>
              <div className="w-full">
                <Skeleton className="h-3 w-24 mb-2 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-20 mt-1 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-2 text-right border-t border-gray-100">
          <Skeleton className="h-3 w-40 ml-auto rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-10 container mx-auto px-4 mb-16">
      {/* <p className="text-center text-gray-600 max-w-2xl mx-auto"> Meet the incredible donors who are
        making knowledge accessible to everyone.
      </p> */}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <DonaterCardSkeleton key={index} />
          ))}
        </div>
      ) : donationData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {donationData.slice(0, 3).map((donation, index) => (
            <DonaterCard
              key={index}
              book={donation.book}
              seller={donation?.donor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">No recent donations found.</p>
          <p className="mt-2 text-gray-500">Be the first to donate a book!</p>
        </div>
      )}
    </div>
  );
}

export default DonationSection;
