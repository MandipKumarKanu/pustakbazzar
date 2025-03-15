import React, { useEffect, useState } from "react";
// import { Skeleton } from "shadcn";
// import DonorCard from "./DonaterCard";
import { Skeleton } from "./ui/skeleton";
import { getLatestDonation } from "@/api/donation";
// import DonorCard from "./DonaterCard";
import DonaterCard from "./DonaterCard";

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-10 container mx-auto mb-16">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <div className="bg-white rounded-xl shadow-lg flex max-w-md w-full max-h-52 mx-auto">
                <div className="w-1/2 bg-blue-100 rounded-l-xl flex items-center justify-center">
                  <Skeleton height={96} width={96} />
                </div>

                <div className="w-1/2 p-6 flex flex-col justify-center">
                  <Skeleton width={150} height={24} />
                  <Skeleton width={120} height={20} className="mt-2" />
                  <Skeleton width={180} height={18} className="mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : donationData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {donationData.map((donation, index) => (
            <DonaterCard
              key={index}
              book={donation.book}
              seller={donation?.donor}
            />
          ))}
        </div>
      ) : (
        <p className="text-center mt-4">No recent donations found.</p>
      )}
    </div>
  );
}

export default DonationSection;
