export const SellingPriceFields = ({ register, errors }) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label
        htmlFor="markedPrice"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Marked Price
      </label>
      <input
        id="markedPrice"
        type="number"
        {...register("markedPrice", { valueAsNumber: true })}
        aria-describedby="markedPriceError"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.markedPrice ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.markedPrice && (
        <p id="markedPriceError" className="text-red-500 text-sm mt-1">
          {errors.markedPrice.message || "Please enter a valid marked price."}
        </p>
      )}
    </div>
    <div>
      <label
        htmlFor="sellingPrice"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Selling Price
      </label>
      <input
        id="sellingPrice"
        type="number"
        {...register("sellingPrice", { valueAsNumber: true })}
        aria-describedby="sellingPriceError"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.sellingPrice ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors.sellingPrice && (
        <p id="sellingPriceError" className="text-red-500 text-sm mt-1">
          {errors.sellingPrice.message || "Please enter a valid selling price."}
        </p>
      )}
    </div>
  </div>
);
