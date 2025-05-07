import React, { useEffect, useState, useCallback } from "react";
import {
  FaShoppingCart,
  FaBox,
  FaBookmark,
  FaTruck,
  FaSpinner,
  FaHeart as FaHeartSolid,
  FaShareAlt,
  FaHandHoldingHeart,
  FaInfoCircle,
  FaAngleRight,
} from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { RWebShare } from "react-web-share";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ShrinkDescription from "@/components/ShrinkDescription";
import BookDescSkeleton from "@/components/BookDescSkeleton";
import { formatPrice } from "@/utils/formatPrice";
import { getBookById, getBookByIdUser, incView } from "@/api/book";
import { Lens } from "@/components/magicui/lens";
import { useIsSaved } from "@/hooks/useSaveLater";
import { removeSaveForLaterApi, saveForLaterApi } from "@/api/saveForLater";
import { useAuthStore } from "@/store/useAuthStore";
import { addToCartApi, removeToCartApi } from "@/api/cart";
import { useIsInCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

const BookDescPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [book, setBook] = useState(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { incCart, decCart, cartCount: cCnt } = useCartStore();

  let cartCount = typeof cCnt === "function" ? cCnt() : cCnt;

  useEffect(() => {
    fetchBook();
    incViews();
    if (user && token) {
      isInWishlist();
      isInCartChk();
    }
  }, [id]);

  const updateInterests = (categoryId) => {
    if (!categoryId) return;

    let interests = [];
    try {
      interests = JSON.parse(localStorage.getItem("interest")) || [];
    } catch {
      interests = [];
    }

    const updatedInterests = [...new Set([...interests, categoryId])];
    if (updatedInterests.length > 5) {
      updatedInterests.splice(0, updatedInterests.length - 5);
    }

    localStorage.setItem("interest", JSON.stringify(updatedInterests));
  };

  useEffect(() => {
    if (book) {
      const catId = book.category?.[0]?._id;
      updateInterests(catId);
    }
  }, [book]);

  const isInWishlist = async () => {
    setIsWishlistLoading(true);
    setIsWishlisted(await useIsSaved(id));
    setIsWishlistLoading(false);
  };

  const isInCartChk = async () => {
    setIsCartLoading(true);
    setIsInCart(await useIsInCart(id));
    setIsCartLoading(false);
  };

  const incViews = async () => {
    try {
      await incView(id);
    } catch (error) {}
  };

  const fetchBook = async () => {
    try {
      setIsLoading(true);
      if (user && token) {
        const res = await getBookByIdUser(id);
        setBook(res.data.book);
      } else {
        const res = await getBookById(id);
        setBook(res.data.book);
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = useCallback(async () => {
    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeSaveForLaterApi(id);
        toast.success("Book Removed from Wishlist");
      } else {
        await saveForLaterApi(id);
        toast.success("Book Added to Wishlist");
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  }, [id, isWishlistLoading]);

  const handleAddToCart = async () => {
    setIsCartLoading(true);
    try {
      if (isInCart) {
        await removeToCartApi(id);
        toast.success("Book Removed from Cart");
        decCart(cartCount);
      } else {
        await addToCartApi(id);
        incCart(cartCount);
        toast.success("Book Added to Cart");
      }
      setIsInCart(!isInCart);
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleBuy = () => {
    let checkoutData = {
      selectedAddressIndex: 0,
      shippingFee: 50,
      subtotal: book.sellingPrice,
      selectedBooks: [
        {
          id,
          bookName: book.title,
          author: book.author,
          sellingPrice: book.sellingPrice,
          images: book.images[0],
          sellerId: book.sellerId,
        },
      ],
    };
    navigate("/billing", { state: { checkoutData } });
  };

  const currentUrl = `${window.location.origin}${location.pathname}`;

  const getStatusBadge = () => {
    if (book.forDonation) {
      return (
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
          <FaHandHoldingHeart className="mr-1" />
          Available for Donation
        </span>
      );
    } else if (book.availability === "rent") {
      return (
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
          <FaAngleRight className="mr-1" />
          Available for Rent
        </span>
      );
    } else if (book.status === "sold" || book.status === "donated") {
      return (
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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
          {book.status === "sold" ? "Sold Out" : "Donated"}
        </span>
      );
    } else {
      return (
        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center">
          <FaAngleRight className="mr-1" />
          Available for Purchase
        </span>
      );
    }
  };

  if (isLoading) {
    return <BookDescSkeleton />;
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  const isOwner =
    user?._id === book?.addedBy?._id || user?.id === book?.addedBy?._id;
  const isUnavailable = book.status === "sold" || book.status === "donated";

  return (
    <div className="flex  bg-gray-50 min-h-screen py-12 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate("/")}
            className="hover:text-purple-600 transition-colors"
          >
            Home
          </button>
          <span className="mx-2">/</span>
          <button
            onClick={() => navigate("/allbooks")}
            className="hover:text-purple-600 transition-colors"
          >
            Books
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {book.title}
          </span>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-visible ">
          <div className=" ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              <div className=" p-6 md:p-8 bg-white border-b md:border-b-0 md:border-r border-gray-100">
                <div className="sticky top-24 space-y-6">
                  <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
                    <Lens
                      zoomFactor={2}
                      lensSize={200}
                      isStatic={false}
                      ariaLabel="Zoom Area"
                    >
                      <img
                        alt={book.title}
                        src={book.images[currentImageIndex]}
                        className="object-cover w-full h-full cursor-crosshair"
                      />
                    </Lens>
                  </div>

                  {book.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                      {book.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-20 rounded-md overflow-hidden snap-start ${
                            currentImageIndex === index
                              ? "ring-2 ring-purple-500"
                              : "ring-1 ring-gray-200"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Book image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleWishlist}
                      disabled={isWishlistLoading || isOwner}
                      className={`flex items-center justify-center p-3 rounded-full ${
                        isWishlisted
                          ? "bg-red-50 text-red-500"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } transition-colors ${
                        isOwner ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isWishlistLoading ? (
                        <FaSpinner className="w-6 h-6 animate-spin" />
                      ) : isWishlisted ? (
                        <FaHeartSolid className="w-6 h-6" />
                      ) : (
                        <FaRegHeart className="w-6 h-6" />
                      )}
                    </button>

                    <RWebShare
                      data={{
                        text: `Check out "${book.title}" by ${book.author} - A must-read book!`,
                        url: currentUrl,
                        title: `PustakBazzar - ${book.title}`,
                      }}
                    >
                      <button className="flex items-center justify-center p-3 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                        <FaShareAlt className="w-6 h-6" />
                      </button>
                    </RWebShare>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 lg:col-span-2">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      {getStatusBadge()}

                      {book.category && book.category.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {book.category.map((c) => (
                            <button
                              key={c.categoryName}
                              onClick={() =>
                                navigate(
                                  `/category/${c.categoryName
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`,
                                  {
                                    state: { value: c._id },
                                  }
                                )
                              }
                              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm capitalize hover:bg-purple-200 transition-colors cursor-pointer"
                            >
                              {c.categoryName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                      {book.title}
                    </h1>

                    <p className="text-xl text-gray-600">
                      by <span className="font-medium">{book.author}</span>
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-4 mb-4">
                      <div className="flex flex-col">
                        {isUnavailable ? (
                          <div className="flex items-center">
                            <span className="text-3xl font-bold text-gray-400 line-through">
                              {formatPrice(book.sellingPrice)}
                            </span>
                            <span className="ml-3 text-red-600 font-semibold">
                              Not Available
                            </span>
                          </div>
                        ) : book.availability === "rent" ? (
                          <>
                            <span className="text-3xl font-bold text-indigo-600">
                              {formatPrice(book.perWeekPrice)}
                              <span className="text-lg font-normal">/week</span>
                            </span>
                            {book.markedPrice > 0 && (
                              <span className="text-sm text-gray-500">
                                Original Price: {formatPrice(book.markedPrice)}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-emerald-600">
                              {formatPrice(book.sellingPrice)}
                            </span>
                            {book.markedPrice > book.sellingPrice && (
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(book.markedPrice)}
                                </span>
                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                  {Math.round(
                                    ((book.markedPrice - book.sellingPrice) /
                                      book.markedPrice) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center mb-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${
                          book.condition === "new"
                            ? "bg-green-100 text-green-700"
                            : book.condition === "good"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {book.condition} condition
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex border-b border-gray-200">
                        <button
                          onClick={() => setActiveTab("description")}
                          className={`py-3 px-4 font-medium text-sm ${
                            activeTab === "description"
                              ? "border-b-2 border-purple-500 text-purple-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Description
                        </button>
                        <button
                          onClick={() => setActiveTab("details")}
                          className={`py-3 px-4 font-medium text-sm ${
                            activeTab === "details"
                              ? "border-b-2 border-purple-500 text-purple-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Book Details
                        </button>
                        <button
                          onClick={() => setActiveTab("delivery")}
                          className={`py-3 px-4 font-medium text-sm ${
                            activeTab === "delivery"
                              ? "border-b-2 border-purple-500 text-purple-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          Shipping
                        </button>
                      </div>

                      <div className="pt-4">
                        {activeTab === "description" && (
                          <div className="text-gray-700 leading-relaxed prose max-w-none">
                            <ShrinkDescription
                              desc={book.description}
                              maxHeight={130}
                            />
                          </div>
                        )}

                        {activeTab === "details" && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                  Availability
                                </span>
                                <span className="font-medium uppercase">
                                  {book.availability || "SELL"}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                  Edition
                                </span>
                                <span className="font-medium">
                                  {book.edition || "First"}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                  Language
                                </span>
                                <span className="font-medium">
                                  {book.language || "English"}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                  Publish Year
                                </span>
                                <span className="font-medium">
                                  {book.publishYear}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                  Seller
                                </span>
                                <span className="font-medium">
                                  {book?.addedBy?.profile?.userName ||
                                    "Unknown"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "delivery" && (
                          <div className="space-y-4">
                            <div className="flex items-center mb-3">
                              <FaTruck className="text-gray-400 w-5 mr-2" />
                              <span className="text-gray-700">
                                Delivery Charge:{" "}
                                <span className="font-medium">₹50</span> on all
                                orders
                              </span>
                            </div>
                            {book.availability !== "rent" && (
                              <div className="mb-3 flex items-center">
                                <FaInfoCircle className="text-gray-400 w-5 mr-2" />
                                <span className="text-gray-700">
                                  No return policy is available.
                                </span>
                              </div>
                            )}

                            {book.availability === "rent" && (
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-medium text-blue-800 mb-2">
                                  Rental Information
                                </h3>
                                <p className="text-gray-700">
                                  Enjoy reading with our flexible rental option.
                                  Rent the book for ₹{book.perWeekPrice}/week
                                  and return it anytime!
                                </p>
                              </div>
                            )}

                            {book.forDonation && (
                              <div className="p-4 bg-green-50 rounded-lg">
                                <h3 className="font-medium text-green-800 mb-2">
                                  Donation Information
                                </h3>
                                <p className="text-gray-700">
                                  This book is being generously offered by{" "}
                                  {book?.addedBy?.profile?.firstName ||
                                    "the owner"}
                                  . You will only need to pay the ₹50 delivery
                                  charge.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                      {!user ? (
                        <div className="space-y-0">
                          <div className="relative group">
                            <button
                              disabled
                              className=" w-full px-6 py-3 mb-3 rounded-3xl text-white text-xl font-bold shadow-lg transition-colors duration-300 ease-in-out bg-gray-400 cursor-not-allowed opacity-70"
                            >
                              <FaShoppingCart className="mr-2 inline" />
                              Add to Cart
                            </button>
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Please login to add to cart
                            </div>
                          </div>

                          <div className="relative group">
                            <button
                              disabled
                              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl text-white text-lg font-semibold shadow-md opacity-70 cursor-not-allowed"
                            >
                              {book.forDonation ? (
                                <>
                                  <FaHandHoldingHeart className="mr-2 inline" />
                                  Request Donation
                                </>
                              ) : book.availability === "rent" ? (
                                <>
                                  <FaShoppingCart className="mr-2 inline" />
                                  Rent Now
                                </>
                              ) : (
                                <>
                                  <FaShoppingCart className="mr-2 inline" />
                                  Buy Now
                                </>
                              )}
                            </button>
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Please login first
                            </div>
                          </div>
                        </div>
                      ) : isOwner ? (
                        // Owner view
                        <div className="space-y-4">
                          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <h3 className="font-medium text-amber-800 mb-2">
                              You own this listing
                            </h3>
                            <p className="text-gray-700">
                              This book was listed by you. You can manage it
                              from your profile.
                            </p>
                          </div>
                          <button
                            onClick={() => navigate("/profile")}
                            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl text-white text-lg font-semibold shadow-md hover:from-amber-600 hover:to-amber-700 transition-colors"
                          >
                            Manage Your Listings
                          </button>
                        </div>
                      ) : isUnavailable ? (
                        // Sold or donated
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-2">
                              No Longer Available
                            </h3>
                            <p className="text-gray-700">
                              We're sorry, but this book is{" "}
                              {book.status === "sold"
                                ? "already sold"
                                : "already donated"}{" "}
                              and is no longer available.
                            </p>
                          </div>
                          <button
                            onClick={() => navigate("/books")}
                            className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-3xl text-white text-lg font-semibold shadow-md hover:from-gray-700 hover:to-gray-800 transition-colors"
                          >
                            Browse Similar Books
                          </button>
                        </div>
                      ) : book.forDonation ? (
                        // Donation book
                        <div className="space-y-4">
                          <button
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-3xl text-white text-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transition-colors"
                            onClick={() =>
                              navigate("/contact", { state: { book } })
                            }
                          >
                            <FaHandHoldingHeart className="mr-2 inline" />
                            Request Donation
                          </button>
                          <p className="text-sm text-gray-500 text-center">
                            By requesting this book, you agree to pay the
                            delivery charge of ₹50.
                          </p>
                        </div>
                      ) : (
                        // Normal purchase options
                        <div className="space-y-0">
                          {book.availability !== "rent" && (
                            <button
                              onClick={handleAddToCart}
                              disabled={isCartLoading}
                              className={`w-full px-6 py-3 mb-3 rounded-3xl text-white text-xl font-bold shadow-lg transition-colors duration-300 ease-in-out cursor-pointer ${
                                isCartLoading
                                  ? "bg-gray-400"
                                  : !isInCart
                                  ? "bg-blue-500 hover:bg-blue-600"
                                  : "bg-gray-600 hover:bg-gray-700"
                              }`}
                            >
                              {isCartLoading ? (
                                <FaSpinner className="animate-spin inline mr-2" />
                              ) : (
                                <FaShoppingCart className="mr-2 inline" />
                              )}
                              {isInCart ? "Remove from Cart" : "Add to Cart"}
                            </button>
                          )}

                          <button
                            className={`w-full px-6 py-3 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-xl font-bold shadow-lg transition-colors duration-300 ease-in-out hover:bg-gradient-to-t hover:from-secondaryColor hover:to-primaryColor cursor-not-allowed ${
                              book.availability === "rent"
                                ? ""
                                : " cursor-not-allowed"
                            }`}
                            onClick={handleBuy}
                            disabled={book.availability !== "rent"}
                            title={
                              book.availability !== "rent"
                                ? "This feature is not available yet"
                                : ""
                            }
                          >
                            {book.availability === "rent"
                              ? "Rent Now"
                              : "Buy Now"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDescPage;
