import UploadImg from "../../assets/image/addbook.png";

export const ImageUploader = ({
  previewImages,
  bookImages,
  onImageChange,
  onRemoveImage,
}) => (
  <div className="space-y-4">
    <div className="bg-gray-100 p-4 rounded-lg shadow-inner min-h-[300px] flex flex-wrap items-center justify-center">
      {previewImages.length > 0 ? (
        previewImages.map((preview, index) => (
          <div key={index} className="relative m-2">
            <img
              src={preview}
              alt={`Book cover ${index + 1}`}
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
              onClick={() => onRemoveImage(index)}
            >
              X
            </button>
          </div>
        ))
      ) : (
        <img
          src={UploadImg}
          alt="Add book"
          className="w-full h-full object-contain rounded-lg"
        />
      )}
    </div>
    <div>
      <label
        htmlFor="bookImages"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Book Images (3-5 images)
      </label>
      <label
        htmlFor="bookImages"
        className="cursor-pointer inline-block bg-primaryColor/90 hover:bg-primaryColor text-white px-3 py-2 rounded-md text-center"
      >
        Choose Files
      </label>
      <input
        id="bookImages"
        type="file"
        accept="image/*"
        onChange={onImageChange}
        multiple
        aria-describedby="image-upload-description"
        className="hidden"
      />
      {bookImages.length < 3 && (
        <p className="text-red-500 text-sm mt-1">
          Please upload at least 3 images
        </p>
      )}
    </div>
  </div>
);
