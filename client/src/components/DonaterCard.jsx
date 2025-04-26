import React from "react";
import { FaUser, FaBookOpen, FaAward } from "react-icons/fa";

const DonaterCard = ({ book, seller }) => {
  const firstName = seller?.profile?.firstName || "Anonymous";
  const lastName = seller?.profile?.lastName || "Donor";
  const donationCount = seller?.donated?.length || 0;
  
  const getBadge = () => {
    if (donationCount >= 10) return "Platinum";
    if (donationCount >= 5) return "Gold";
    if (donationCount >= 3) return "Silver";
    return "Bronze";
  };

  const getBadgeColor = () => {
    switch(getBadge()) {
      case "Platinum": return "bg-gradient-to-r from-blue-600 to-purple-600";
      case "Gold": return "bg-gradient-to-r from-amber-500 to-yellow-400";
      case "Silver": return "bg-gradient-to-r from-gray-400 to-gray-300";
      default: return "bg-gradient-to-r from-amber-700 to-yellow-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden max-w-2xl w-full mx-auto border border-gray-100 flex flex-col sm:flex-row">
      <div className="relative w-full sm:w-1/3 sm:min-h-full">
        <div className={`absolute top-2 right-3 ${getBadgeColor()} text-white text-[10px] font-bold px-3 py-1 rounded-full z-20 backdrop-blur-sm shadow-lg`}>
          {getBadge()}
        </div>
        
        <div className="h-40 sm:h-full w-full bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 flex items-center justify-center overflow-hidden">
          {seller?.profile?.profileImg ? (
            <img
              src={seller?.profile.profileImg}
              alt={`${firstName} ${lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
              <FaUser className="text-white text-4xl" />
            </div>
          )}
        </div>
      </div>
      <div className="w-full sm:w-2/3 flex flex-col justify-between p-0">
        <div className="px-5 py-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center capitalize">
            {firstName} {lastName}
            <FaAward className="text-amber-500 ml-2 shrink-0" />
          </h2>
          
          <div className="flex items-center mt-2 text-sm">
            <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-md font-medium mr-2">
              {donationCount} {donationCount === 1 ? 'Contribution' : 'Contributions'}
            </span>
            <span className="text-gray-500">Member since {seller?.createdAt ? new Date(seller.createdAt).getFullYear() : 'N/A'}</span>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-start">
              <FaBookOpen className="text-primary mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Recent donation</p>
                <p className="text-sm text-gray-800 font-medium line-clamp-2 capitalize">{book.title}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {book.author && `by ${book.author}`}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom message */}
        <div className="bg-gray-50 px-5 py-2 text-right border-t border-gray-100">
          <span className="text-xs text-gray-500">Thank you for making a difference!</span>
        </div>
      </div>
    </div>
  );
};

export default DonaterCard;
