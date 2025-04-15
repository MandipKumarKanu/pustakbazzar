import React from "react";
import { FaTimes } from "react-icons/fa";
import PrimaryBtn from "./PrimaryBtn";

const SellerForm = ({
  IsModalOpenForSeller,
  handleCloseModalForSeller,
  handleSaveDoc,
  setDocFile,
}) => {
  if (!IsModalOpenForSeller) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white p-8 rounded-lg max-w-lg w-full shadow-lg mx-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">
            Apply For Seller
          </h2>
          <button
            onClick={handleCloseModalForSeller}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <label className="block">
            <span className="text-lg font-medium">Upload PAN/VAT document</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setDocFile(e.target.files[0])}
              className="mt-2 block w-full border border-gray-300 rounded-lg px-4 py-2 text-lg"
            />
          </label>

          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={handleCloseModalForSeller}
              className="text-lg bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-150"
            >
              Cancel
            </button>

            <PrimaryBtn
              name="Apply"
              style="max-w-[150px]"
              onClick={handleSaveDoc}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerForm;
