import React from "react";
import { FaUser } from "react-icons/fa";

const DonaterCard = ({ book, seller }) => {
  // console.log(seller?.proile?.profileImg);
  return (
    <div className="bg-white border rounded-xl shadow-lg flex max-w-md w-full max-h-52 mx-auto">
      <div className="w-1/2 bg-primaryColor/10 rounded-l-xl flex items-center justify-center">
        {seller?.profile?.profileImg ? (
          <img
            src={seller?.profile.profileImg}
            alt={seller?.firstName}
            className="w-full h-full object-cover rounded-l-xl"
          />
        ) : (
          <div className="w-24 h-24  bg-primaryColor/10 rounded-full flex items-center justify-center">
            <FaUser className="text-primaryColor/50 text-4xl" />
          </div>
        )}
      </div>

      <div className="w-1/2 p-6 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {seller?.profile?.firstName} {seller?.profile?.lastName}
        </h2>
        <p className="text-gray-600">Total Contribution: {seller?.donated?.length}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2 font-semibold">
          Recent: {book.title}
        </p>
      </div>
    </div>
  );
};

export default DonaterCard;
