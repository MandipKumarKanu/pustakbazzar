import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadImg from "../assets/image/addbook.png";
import { ImageUploader } from "./book/ImageUploader";
import { bookSchema } from "./book/bookSchema";
import { CategorySelector } from "./book/CategorySelector";
import { conditions } from "./book/bookConstant";
import { SellingPriceFields } from "./book/SellingPriceFields";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Cloudinary } from "cloudinary-core";
import { useAuthStore } from "@/store/useAuthStore";
import { addBook } from "@/api/book";
import { toast } from "sonner";
import { CKEditorComp } from "./ckEditor";

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUD_NAME,
  secure: true,
});

const AddBook = () => {
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bookImages, setBookImages] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cateError, setCateError] = useState(null);
  const [desc, setDesc] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  const { user } = useAuthStore();

  const { category: categoryData } = useCategoryStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      bookFor: "donation",
      markedPrice: 0,
      sellingPrice: 0,
      category: [],
      condition: "",
    },
  });

  useEffect(() => {
    console.log(selectedCategories.length);
    if (selectedCategories.length >= 4) {
      setCateError("Category must not be greater than 3");
    } else if (selectedCategories.length === 0) {
      setCateError("Category must not be empty");
    } else {
      setCateError(null);
    }
  }, [selectedCategories]);

  const bookForValue = watch("bookFor");

  const onSubmit = async (data) => {
    if (selectedFiles.length < 3) {
      alert("Please select at least 3 book images");
      return;
    }
    try {
      setLoading(true);
      const uploadedImages = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "pustakbazar");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${
            cloudinary.config().cloud_name
          }/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const imageData = await response.json();
        uploadedImages.push(imageData.secure_url);
      }

      console.log("Submitting book data:", {
        ...data,
        category: selectedCategories,
        images: uploadedImages,
      });

      const categoryValue = selectedCategories.map((item) => item.value);

      const dataToSend = {
        title: data.bookName,
        description: desc,
        author: data.author,
        category: categoryValue,
        markedPrice: data.bookFor === "donation" ? 0 : data.markedPrice,
        sellingPrice: data.bookFor === "donation" ? 0 : data.sellingPrice,
        images: uploadedImages,
        condition: data.condition,
        forDonation: data.bookFor === "donation",
        publishYear: data.publishYear,
      };

      await addBook(dataToSend);

      toast.success(
        `${
          data.bookFor === "donation"
            ? "Thank you for contribution!"
            : "Book added successfully!"
        }`
      );
      setPreviewImages([]);
      setSelectedFiles([]);
      setSelectedCategories([]);
      reset();
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Error adding book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      alert("You can upload a maximum of 5 images");
      e.target.value = null;
      return;
    }
    const newImages = files.filter((file) => file.size <= 5 * 1024 * 1024);
    if (newImages.length !== files.length) {
      alert("Some files were skipped because they exceed the 5MB size limit");
    }

    setSelectedFiles((prev) => [...prev, ...newImages]);
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
    e.target.value = null;
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-2 py-4">
      <div className="max-w-4xl mt-10 mx-auto bg-gray-50 shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
            Add Book
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploader
              previewImages={previewImages}
              bookImages={bookImages}
              onImageChange={handleImageChange}
              onRemoveImage={removeImage}
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label
                  htmlFor="bookName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Book Name
                </label>
                <input
                  id="bookName"
                  {...register("bookName")}
                  className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bookName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.bookName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bookName.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="bookLanguage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Language
                  </label>
                  <input
                    id="bookLanguage"
                    {...register("bookLanguage")}
                    className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bookLanguage ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.bookLanguage && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bookLanguage.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Author
                  </label>
                  <input
                    id="author"
                    {...register("author")}
                    className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.author ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.author && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.author.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="edition"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Edition
                  </label>
                  <input
                    id="edition"
                    {...register("edition")}
                    className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.edition ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.edition && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.edition.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="publishYear"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Publish Year
                  </label>
                  <input
                    id="publishYear"
                    {...register("publishYear")}
                    className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.publishYear ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.publishYear && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.publishYear.message}
                    </p>
                  )}
                </div>
              </div>
              <CategorySelector
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                error={errors.category}
                categoryData={categoryData}
              />
              {cateError && (
                <p className="text-red-500 text-xs mt-1">{cateError}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  {...register("condition")}
                  className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.condition ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select condition</option>
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.condition.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book for
                </label>
                <div className="flex space-x-2">
                  <label htmlFor="bookFor" className="inline-flex items-center">
                    <input
                      type="radio"
                      {...register("bookFor")}
                      value={"donation"}
                      className="form-radio h-4 w-4 text-blue-600"
                    />

                    <span className="ml-1 text-gray-700 capitalize">
                      donation
                    </span>
                  </label>

                  {user?.seller?.status === "approved" && (
                    <label
                      htmlFor="bookFor"
                      className="inline-flex items-center"
                    >
                      <input
                        type="radio"
                        {...register("bookFor")}
                        value={"sell"}
                        className="form-radio h-4 w-4 text-blue-600"
                      />

                      <span className="ml-1 text-gray-700 capitalize">
                        sell
                      </span>
                    </label>
                  )}
                </div>
                {errors.bookFor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bookFor.message}
                  </p>
                )}
              </div>
              {bookForValue === "sell" && (
                <SellingPriceFields register={register} errors={errors} />
              )}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                {/* <textarea
                  id="description"
                  {...register("description")}
                  className={`w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={3}
                ></textarea> */}

                <CKEditorComp content={desc} setContent={setDesc} />

                {/* {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )} */}
              </div>
              <button
                type="submit"
                disabled={loading || cateError}
                className="w-full bg-blue-500 px-3 py-2 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white font-bold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding Book...
                  </span>
                ) : (
                  "Add Book"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
