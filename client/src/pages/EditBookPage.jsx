import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getBookById, updateBook, getAuthor } from "@/api/book";
import { CategorySelector } from "@/components/book/CategorySelector";
import { CKEditorComp } from "@/components/ckEditor";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Cloudinary } from "cloudinary-core";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { conditions } from "@/components/book/bookConstant";
import PrimaryBtn from "@/components/PrimaryBtn";
import getErrorMessage from "@/utils/getErrorMsg";
import AutocompleteInput from "@/components/ui/AutocompleteInput";
import { Languages, User } from "lucide-react";
import { RiSortNumberAsc } from "react-icons/ri";
import { editionOptions, languageOptions } from "@/hooks/helper";
import { customAxios } from "@/config/axios";
import { bookSchema } from "@/components/book/bookSchema";
// import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [authors, setAuthors] = useState([]);

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cateError, setCateError] = useState(null);
  const [desc, setDesc] = useState("");
  const [descError, setDescError] = useState(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const { category: categoryData } = useCategoryStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(bookSchema),
    mode: "onChange",
  });

  const bookForValue = watch("bookFor");

  useEffect(() => {
    fetchBook();
    fetchAuthors();
  }, [id]);

  const fetchAuthors = async () => {
    try {
      const res = await getAuthor();
      setAuthors(res.data.authors);
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  useEffect(() => {
    if (selectedCategories.length >= 4) {
      setCateError("Category must not be greater than 3");
    } else if (selectedCategories.length === 0) {
      setCateError("Category must not be empty");
    } else {
      setCateError(null);
    }
  }, [selectedCategories]);

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024
    );
    if (newImages.length !== acceptedFiles.length) {
      toast.warning(
        "Some files were skipped because they exceed the 5MB size limit"
      );
    }

    setSelectedFiles((prev) => [...prev, ...newImages]);
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

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
      setValue("isbn", bookData.isbn);
      setValue("edition", bookData.edition);
      setValue("publishYear", bookData.publishYear);
      setValue("condition", bookData.condition);
      setValue("bookFor", bookData.forDonation ? "donation" : "sell");

      if (!bookData.forDonation) {
        setValue("markedPrice", bookData.markedPrice);
        setValue("sellingPrice", bookData.sellingPrice);
      }

      setPreviewImages(bookData?.images || []);

      if (bookData.category && bookData.category.length > 0) {
        const bookCategories = bookData.category.map((cat) => {
          return {
            value: typeof cat === "object" ? cat._id : cat,
            label:
              typeof cat === "object"
                ? cat.categoryName
                : cat?.categoryName || cat,
          };
        });
        setSelectedCategories(bookCategories);
      }
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const generateDescription = async () => {
    const title = watch("bookName");
    const author = watch("author");
    const condition = watch("condition");

    if (!title || !author || !condition) {
      toast.error("Please fill in the book name, author, and condition first.");
      return;
    }

    try {
      setGeneratingDesc(true);
      const response = await customAxios.post("book/generate-description", {
        title,
        author,
        condition,
      });

      if (response.data?.description) {
        setDesc(response.data.description);
        toast.success("Description generated successfully!");
      } else {
        toast.error("Failed to generate description. Please try again.");
        setDesc("");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Error generating description. Please try again.");
      setDesc("");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleUpdate = async (data) => {
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
        if (imageData.secure_url) {
          uploadedImages.push(imageData.secure_url);
        }
      }

      const categoryValue = selectedCategories.map((item) => item.value);

      const existingBookImages = book?.images || [];
      const keptImages = existingBookImages.filter((img) =>
        previewImages.includes(img)
      );
      const finalImages = [...keptImages, ...uploadedImages];

      const updatedData = {
        title: data.bookName,
        description: desc,
        author: data.author,
        isbn: data.isbn,
        bookLanguage: data.bookLanguage,
        edition: data.edition,
        category: categoryValue,
        markedPrice: data.bookFor === "donation" ? 0 : data.markedPrice,
        sellingPrice: data.bookFor === "donation" ? 0 : data.sellingPrice,
        images: finalImages,
        condition: data.condition,
        forDonation: data.bookFor === "donation",
        publishYear: data.publishYear,
      };

      await updateBook(id, updatedData);
      toast.success("Book updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error(error.response?.data?.message || "Failed to update the book");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async (e) => {
    e.preventDefault();

    const stepFields = getStepFields(activeStep);
    const isValid = await trigger(stepFields);

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const prevStep = (e) => {
    e.preventDefault();

    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const getStepFields = (step) => {
    switch (step) {
      case 1:
        return [
          "bookName",
          "isbn",
          "bookLanguage",
          "author",
          "edition",
          "publishYear",
        ];
      case 2:
        return ["markedPrice", "sellingPrice", "bookFor", "condition"];
      case 3:
        return ["description"];
      default:
        return [];
    }
  };

  const formSteps = [
    {
      title: "Book Details",
      subtitle: "Update basic information about your book",
      icon: "📝",
    },
    {
      title: "Categories & Condition",
      subtitle: "Select categories and book condition",
      icon: "🏷️",
    },
    {
      title: "Images & Description",
      subtitle: "Update images and describe your book",
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
                  {...register("bookName", {
                    required: "Book name is required",
                  })}
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

              <div className="space-y-2">
                <label
                  htmlFor="isbn"
                  className="block text-sm font-medium text-gray-700"
                >
                  ISBN
                </label>
                <input
                  id="isbn"
                  {...register("isbn")}
                  placeholder="Enter ISBN (e.g., 9781234567897)"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.isbn
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.isbn && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.isbn.message}
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
                  <AutocompleteInput
                    authors={authors || []}
                    value={watch("author")}
                    onChange={(value) => setValue("author", value)}
                    error={errors.author}
                    register={register}
                    name="author"
                    placeholder="Enter author name"
                    label="Type any author name or select from suggestions"
                    icon={<User className="h-4 w-4 text-blue-500" />}
                    hintText="Continue with"
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
                  <AutocompleteInput
                    authors={languageOptions || []}
                    value={watch("bookLanguage")}
                    onChange={(value) => setValue("bookLanguage", value)}
                    error={errors.bookLanguage}
                    register={register}
                    name="bookLanguage"
                    placeholder="Enter book language"
                    label="Select a language from the list"
                    icon={<Languages className="h-4 w-4 text-blue-500" />}
                    hintText="Continue with"
                    optionsOnly
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
                  <AutocompleteInput
                    authors={editionOptions || []}
                    value={watch("edition")}
                    onChange={(value) => setValue("edition", value)}
                    error={errors.edition}
                    register={register}
                    name="edition"
                    placeholder="Enter book edition"
                    label="Select an edition from the list"
                    icon={<RiSortNumberAsc className="h-4 w-4 text-blue-500" />}
                    hintText="Continue with"
                    optionsOnly
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
                </div>
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
                  {previewImages.length < 1 && (
                    <p className="text-red-500 text-xs mt-1">
                      Please Select at least 1 image
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
                            className="w-full h-24 object-contain"
                            style={{ mixBlendMode: "multiply" }}
                          />
                          <div className="absolute inset-0 bg-black/50 bg-opacity-40 opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-xs transition-opacity flex items-center justify-center">
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {" "}
                    Description{" "}
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={generatingDesc}
                      className={`
                        group flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium 
                        shadow-sm transition-all duration-300 
                        ${
                          generatingDesc
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
                        }
                      `}
                    >
                      {generatingDesc ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>AI is working...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5 text-indigo-100 group-hover:text-white transition-colors"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3 12H4M12 3V4M20 12H21M12 20V21M5.63607 5.63604L6.34317 6.34315M18.364 5.63604L17.6569 6.34315M6.34317 17.6569L5.63607 18.364M17.6569 17.6569L18.364 18.364"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Generate with AI</span>
                        </>
                      )}
                    </button>

                    {descError && (
                      <button
                        type="button"
                        onClick={generateDescription}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Regenerate
                      </button>
                    )}
                  </div>
                </div>

                {generatingDesc && (
                  <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.99999 16.1716L19.1716 7L20.5858 8.41421L9.99999 19L3.41421 12.4142L4.82842 11L9.99999 16.1716Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-blue-700">
                        AI is creating your description. This may take a
                        moment...
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className={`border rounded-lg transition-all duration-200 ${
                    generatingDesc
                      ? "border-blue-300 shadow-md shadow-blue-100"
                      : "border-gray-200"
                  }`}
                >
                  <CKEditorComp
                    content={
                      generatingDesc
                        ? "✨ Wait for magic... AI is crafting your description ✨"
                        : desc
                    }
                    setContent={setDesc}
                  />
                </div>

                {descError && (
                  <p className="flex items-center gap-2 text-red-500 text-sm mt-1">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    {descError}
                  </p>
                )}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gray-50 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-gray-800">
              Update Your Book
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Edit your book listing details
            </p>

            {renderStepIndicator()}

            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-8">
              {getStepContent()}

              <div className="flex justify-between pt-6 border-t border-gray-200">
                <PrimaryBtn
                  type="button"
                  onClick={(e) => prevStep(e)}
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

                {activeStep < 3 ? (
                  <PrimaryBtn
                    type="button"
                    onClick={(e) => nextStep(e)}
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
                    type="submit"
                    disabled={
                      loading || cateError || previewImages.length === 0
                    }
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
                        <>Update Book</>
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

export default EditBookPage;
