import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSchema } from "./book/bookSchema";
import { conditions } from "./book/bookConstant";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { addBook } from "@/api/book";
import { toast } from "sonner";
import { CKEditorComp } from "./ckEditor";
import { Cloudinary } from "cloudinary-core";
import PrimaryBtn from "./PrimaryBtn";
import { useDropzone } from "react-dropzone";
import { CategorySelector } from "./book/CategorySelector";

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUD_NAME,
  secure: true,
});

const AddBook = () => {
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cateError, setCateError] = useState(null);
  const [desc, setDesc] = useState("");
  const [descError, setDescError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const { user } = useAuthStore();
  const { category: categoryData } = useCategoryStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(bookSchema),
    mode: "onChange",
    defaultValues: {
      bookFor: "donation",
      markedPrice: 0,
      sellingPrice: 0,
      category: [],
      condition: "",
    },
  });

  useEffect(() => {
    if (selectedCategories.length >= 4) {
      setCateError("Category must not be greater than 3");
    } else if (selectedCategories.length === 0) {
      setCateError("Category must not be empty");
    } else {
      setCateError(null);
    }
  }, [selectedCategories]);

  const bookForValue = watch("bookFor");

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024
    );
    if (newImages.length !== acceptedFiles.length) {
      alert("Some files were skipped because they exceed the 5MB size limit");
    }

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    handleImageChange({ target: { files: newImages } });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"], 
    },
    multiple: true,
  });

  const onSubmit = async (data) => {
    if (selectedFiles.length < 1) {
      return;
    }

    if (desc.trim() === "") {
      setDescError("Description is required");
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
        data.bookFor === "donation"
          ? "Thank you for your contribution!"
          : "Book added successfully!"
      );

      setPreviewImages([]);
      setSelectedFiles([]);
      setSelectedCategories([]);
      setDesc("");
      setActiveStep(1);
      reset();
    } catch (error) {
      console.error("Error adding book:", error.response?.data?.message);
      if (error.response?.data?.message) {
        if (
          error.response.data.message ===
          "Book validation failed: description: Path `description` is required."
        ) {
          setDescError("Description is required");
        }
        toast.error(error.response.data.message);
      } else {
        toast.error("Error adding book. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      e.target.value = null;
      return;
    }

    const newImages = files.filter((file) => file.size <= 5 * 1024 * 1024);
    if (newImages.length !== files.length) {
      toast.warning(
        "Some files were skipped because they exceed the 5MB size limit"
      );
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

  const nextStep = async () => {
    const stepFields = getStepFields(activeStep);
    const isValid = await trigger(stepFields);

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const getStepFields = (step) => {
    switch (step) {
      case 1:
        return ["bookName", "bookLanguage", "author", "edition", "publishYear"];
      case 2:
        return ["markedPrice", "sellingPrice", "bookFor", "condition"];
      case 3:
        return ["description"];
      default:
        return [];
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const formSteps = [
    {
      title: "Book Details",
      subtitle: "Add basic information about your book",
      icon: "📝",
    },
    {
      title: "Categories & Condition",
      subtitle: "Select categories and book condition",
      icon: "🏷️",
    },
    {
      title: "Images & Description",
      subtitle: "Upload images and describe your book",
      icon: "📸",
    },
  ];

  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {formSteps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 relative ${
                index < formSteps.length - 1
                  ? "after:content-[''] after:h-1 after:w-full after:absolute after:top-5 after:left-1/2 after:bg-gray-200 after:-z-10"
                  : ""
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 text-xl ${
                    index + 1 === activeStep
                      ? "bg-blue-600 text-white"
                      : index + 1 < activeStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1 < activeStep ? "✓" : step.icon}
                </div>
                <h3 className="font-medium text-sm">{step.title}</h3>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {step.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label
                  htmlFor="bookName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Book Name
                </label>
                <input
                  id="bookName"
                  {...register("bookName")}
                  placeholder="Enter book title"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.bookName
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.bookName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bookName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Author
                  </label>
                  <input
                    id="author"
                    {...register("author")}
                    placeholder="Author name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.author
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.author && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.author.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="bookLanguage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Language
                  </label>
                  <input
                    id="bookLanguage"
                    {...register("bookLanguage")}
                    placeholder="Book language"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.bookLanguage
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.bookLanguage && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bookLanguage.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label
                    htmlFor="edition"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Edition
                  </label>
                  <input
                    id="edition"
                    {...register("edition")}
                    placeholder="Book edition"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.edition
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.edition && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.edition.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="publishYear"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Publication Year
                  </label>
                  <input
                    id="publishYear"
                    {...register("publishYear")}
                    placeholder="Year published"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.publishYear
                        ? "border-red-500 ring-1 ring-red-500"
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
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
              
                <CategorySelector
                  selectedCategories={selectedCategories}
                  onCategoryChange={setSelectedCategories}
                  error={errors.category}
                  categoryData={categoryData}
                />

                {cateError && (
                  <p className="text-red-500 text-xs mt-1">{cateError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Book Condition
                </label>
                <select
                  {...register("condition")}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.condition
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300"
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Book for
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      bookForValue === "donation"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      const radioBtn = document.querySelector(
                        'input[value="donation"]'
                      );
                      if (radioBtn) radioBtn.click();
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="donationRadio"
                        {...register("bookFor")}
                        value="donation"
                        className="h-5 w-5 text-blue-600"
                      />
                      <div>
                        <label
                          htmlFor="donationRadio"
                          className="font-medium text-gray-800"
                        >
                          Donation
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Donate your book to help others
                        </p>
                      </div>
                    </div>
                  </div>

                  {user?.seller?.status === "approved" && (
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        bookForValue === "sell"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        const radioBtn = document.querySelector(
                          'input[value="sell"]'
                        );
                        if (radioBtn) radioBtn.click();
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="sellRadio"
                          {...register("bookFor")}
                          value="sell"
                          className="h-5 w-5 text-blue-600"
                        />
                        <div>
                          <label
                            htmlFor="sellRadio"
                            className="font-medium text-gray-800"
                          >
                            Sell
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            List your book for sale
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {errors.bookFor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bookFor.message}
                  </p>
                )}
              </div>

              {bookForValue === "sell" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="markedPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Marked Price (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="markedPrice"
                        type="number"
                        {...register("markedPrice", { valueAsNumber: true })}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.markedPrice
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.markedPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.markedPrice.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="sellingPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Selling Price (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        id="sellingPrice"
                        type="number"
                        {...register("sellingPrice", { valueAsNumber: true })}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.sellingPrice
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.sellingPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.sellingPrice.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex gap-2">
                  Book Images (Up to 5){" "}
                  {selectedFiles.length < 1 && (
                    <p className="text-red-500 text-xs mt-1">
                      Please Select at least 3 image
                    </p>
                  )}
                </label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center"
                >
                  <input {...getInputProps()} />

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 text-center mb-2">
                    {isDragActive
                      ? "Release to drop the files here"
                      : "Drag & drop images here, or click to select files"}
                  </p>
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Maximum 5 images, 5MB each
                  </p>
                  <p
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Select Files
                  </p>
                </div>

                {previewImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Images:{" "}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ">
                      {previewImages.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0  bg-black/50 bg-opacity-40 opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-xs transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <CKEditorComp content={desc} setContent={setDesc} />
                {descError && (
                  <p className="text-red-500 text-xs mt-1">{descError}</p>
                )}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className=" min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gray-50 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-800">
              Add Your Book
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Share your book with others or list it for sale
            </p>

            {renderStepIndicator()}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {getStepContent()}

              <div className="flex justify-between pt-6 border-t border-gray-200">
                <PrimaryBtn
                  type="button"
                  onClick={prevStep}
                  style={`bg-gray-100 hover:bg-gray-200 flex items-center gap-2 transition-all ${
                    activeStep === 1
                      ? "invisible"
                      : "text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400"
                  }`}
                  name={
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </>
                  }
                />

                {/* </button> */}

                {activeStep < 3 ? (
                  <PrimaryBtn
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
                    name={
                      <>
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </>
                    }
                  />
                ) : (
                  <PrimaryBtn
                    disabled={loading || cateError}
                    name={
                      loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
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
                          Processing...
                        </>
                      ) : (
                        <>Submit Book</>
                      )
                    }
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
