import { getBookById, updateBook } from "@/api/book";
import { CategorySelector } from "@/components/book/CategorySelector";
import { ImageUploader } from "@/components/book/ImageUploader";
import { SellingPriceFields } from "@/components/book/SellingPriceFields";
import { CKEditorComp } from "@/components/ckEditor";
import getErrorMessage from "@/utils/getErrorMsg";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Cloudinary } from "cloudinary-core";
import { toast } from "sonner";

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUD_NAME,
  secure: true,
});

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const { category: categoryData } = useCategoryStore();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bookImages, setBookImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const [desc, setDesc] = useState("");
  const bookFor = watch("bookFor");

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setIsLoading(true);
      const res = await getBookById(id);
      const bookData = res.data.book;
      setBook(bookData);
      setDesc(bookData.description);
      setValue("bookName", bookData.title);
      setValue("bookLanguage", bookData.bookLanguage);
      setValue("author", bookData.author);
      setValue("edition", bookData.edition);
      setValue("publishYear", bookData.publishYear);
      setValue("condition", bookData.condition);
      setValue("bookFor", bookData.forDonation ? "donation" : "sell");

      setPreviewImages(bookData?.images);

      if (!bookData.forDonation) {
        setValue("markedPrice", bookData.markedPrice);
        setValue("sellingPrice", bookData.sellingPrice);
      }

      if (bookData.category && bookData.category.length > 0) {
        const categoryIds = bookData.category.map((cat) => cat._id);
        const selectedCategories = categoryData.filter((cat) =>
          categoryIds.includes(cat.value)
        );
        setSelectedCategories(selectedCategories);
      }
    } catch (error) {
      console.log(error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
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

  const handleUpdate = async (data) => {
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
        if (imageData.secure_url) {
          uploadedImages.push(imageData.secure_url);
        }
      }

      const categoryValue = selectedCategories.map((item) => item.value);

      const oldImages = book?.images || [];
      const finalImages = [...oldImages, ...uploadedImages];

      const updatedData = {
        title: data.bookName,
        description: desc,
        author: data.author,
        category: categoryValue,
        markedPrice: data.bookFor === "donation" ? 0 : data.markedPrice,
        sellingPrice: data.bookFor === "donation" ? 0 : data.sellingPrice,
        images: finalImages,
        condition: data.condition,
        forDonation: data.bookFor === "donation",
        publishYear: data.publishYear,
      };

      const response = await updateBook(id, updatedData);
      fetchBook()

      toast.success("Book updated successfully");
      console.log("Updated Book Data:", updatedData);
    } catch (error) {
      console.error("Error updating book:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && !book) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="container mx-auto px-2 py-4">
        <div className="max-w-4xl mt-10 mx-auto bg-gray-50 shadow-lg rounded-lg overflow-hidden">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Update Book
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploader
                previewImages={previewImages}
                bookImages={bookImages}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
              />
              <form onSubmit={handleSubmit(handleUpdate)} className="space-y-3">
                <div>
                  <label
                    htmlFor="bookName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Book Name
                  </label>
                  <input
                    id="bookName"
                    {...register("bookName", {
                      required: "Book name is required",
                    })}
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
                        errors.bookLanguage
                          ? "border-red-500"
                          : "border-gray-300"
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
                        errors.publishYear
                          ? "border-red-500"
                          : "border-gray-300"
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
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="acceptable">Acceptable</option>
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
                    <label
                      htmlFor="bookForDonation"
                      className="inline-flex items-center"
                    >
                      <input
                        type="radio"
                        id="bookForDonation"
                        {...register("bookFor")}
                        value="donation"
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-1 text-gray-700 capitalize">
                        donation
                      </span>
                    </label>
                    <label
                      htmlFor="bookForSell"
                      className="inline-flex items-center"
                    >
                      <input
                        type="radio"
                        id="bookForSell"
                        {...register("bookFor")}
                        value="sell"
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-1 text-gray-700 capitalize">
                        sell
                      </span>
                    </label>
                  </div>
                </div>
                {bookFor === "sell" && (
                  <SellingPriceFields register={register} errors={errors} />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <CKEditorComp content={desc} setContent={setDesc} />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 px-3 py-2 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white font-bold shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Book"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBookPage;
