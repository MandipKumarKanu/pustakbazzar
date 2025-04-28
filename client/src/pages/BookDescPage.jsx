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

const BookDescPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [book, setBook] = useState(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      console.log("adding to wishlist");
      if (isWishlisted) {
        await removeSaveForLaterApi(id);
      } else {
        await saveForLaterApi(id);
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
        decCart(cartCount);
      } else {
        await addToCartApi(id);
        incCart(cartCount);
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

  if (isLoading) {
    return <BookDescSkeleton />;
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <div className=" flex items-center">
      <div className="container mx-auto mt-12 mb-6 px-6 py-8 bg-purple-100 rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:relative">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] flex-shrink-0 overflow-hidden rounded-lg bg-white shadow">
                <Lens
                  zoomFactor={2}
                  lensSize={200}
                  isStatic={false}
                  ariaLabel="Zoom Area"
                  lensColor="red"
                >
                  <img
                    alt={book.title}
                    src={book.images[currentImageIndex]}
                    className="object-cover w-full h-full cursor-crosshair"
                  />
                </Lens>
              </div>
              {
                <div className="mt-4 flex gap-2 justify-center">
                  {book.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        currentImageIndex === index
                          ? "border-purple-500"
                          : "border-transparent"
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
              }
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600">by {book.author}</p>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <div className="flex flex-col">
                {book.availability === "rent" ? (
                  <>
                    <span className="text-3xl font-bold text-btnColor">
                      {formatPrice(book.perWeekPrice)}/week
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
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(book.markedPrice)}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleWishlist}
                  disabled={
                    isWishlistLoading ||
                    user?._id === book?.addedBy?._id ||
                    user?.id === book?.addedBy?._id
                  }
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors duration-200 relative"
                >
                  {isWishlistLoading ? (
                    <FaSpinner className="text-2xl animate-spin" />
                  ) : isWishlisted ? (
                    <FaHeartSolid className="text-red-500 text-2xl" />
                  ) : (
                    <FaRegHeart className="text-2xl" />
                  )}
                </button>
                <RWebShare
                  data={{
                    text: `Check out "${book.title}" by ${book.author} - A must-read book!`,
                    url: currentUrl,
                    title: `KitabKunj - ${book.title}`,
                  }}
                  onClick={() => console.log("shared successfully!")}
                >
                  <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                    <FaShareAlt className="text-2xl" />
                  </button>
                </RWebShare>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-center">
                <FaBox className="text-gray-400 w-5 mr-2" />
                <span className="text-gray-700">Condition: </span>
                <span
                  className={`ml-1 font-medium uppercase px-3 py-1 rounded-full text-sm ${
                    book.condition === "new"
                      ? "bg-green-100 text-green-700"
                      : book.condition === "good"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {book.condition}
                </span>
              </div>
              <div className="flex items-center">
                <FaBookmark className="text-gray-400 w-5 mr-2" />
                <span className="text-gray-700">Category: </span>
                <div className="ml-1 flex gap-2 flex-wrap">
                  {book.category.map((c) => (
                    <span
                      key={c.categoryName}
                      className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm capitalize"
                    >
                      {c.categoryName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About this book:
              </h2>
              <div className="text-gray-600 leading-relaxed">
                <ShrinkDescription desc={book.description} size={300} />
              </div>
            </div>
          </div>

          <div>
            <div className="lg:sticky top-24">
              <div className="bg-green-50 rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Product Details
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="text-gray-900 uppercase font-bold">
                      {book.availability || "SELL"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Edition:</span>
                    <span className="text-gray-900">
                      {book.edition || "First"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="text-gray-900">
                      {book.language || "English"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publish Year:</span>
                    <span className="text-gray-900">{book.publishYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller:</span>
                    <span className="text-gray-900">
                      {book?.addedBy?.profile?.userName || ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 rounded-lg p-6 shadow">
                {!user ? (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {book.forDonation
                        ? "Donation Book Information"
                        : "Delivery Information"}
                    </h2>

                    {book.forDonation ? (
                      <div className="mb-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                          <div className="flex items-center mb-2">
                            <FaHandHoldingHeart className="text-green-500 w-5 mr-2" />
                            <span className="text-green-700 font-medium">
                              This book is available for donation
                            </span>
                          </div>
                          <p className="text-gray-700">
                            This book is generously being offered for donation.
                            Login to request it.
                          </p>
                        </div>

                        <div className="relative group">
                          <button
                            disabled
                            className="w-full px-6 py-3 bg-gradient-to-t from-green-600 to-green-500 rounded-3xl text-white text-xl font-bold shadow-lg opacity-70 cursor-not-allowed"
                          >
                            <FaHandHoldingHeart className="mr-2 inline" />
                            Contact us
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                            Please login to request this donation
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center mb-3">
                          <FaTruck className="text-gray-400 w-5 mr-2" />
                          <span className="text-gray-700">
                            Delivery Charge: ₹50 on all orders
                          </span>
                        </div>
                        {book.availability !== "rent" && (
                          <div className="mb-3">
                            <span className="text-gray-700">
                              No return policy is available.
                            </span>
                          </div>
                        )}

                        <div className="relative group">
                          <button
                            disabled
                            className="w-full px-6 py-3 mb-3 rounded-3xl text-white text-xl font-bold shadow-lg bg-blue-400 cursor-not-allowed opacity-70"
                          >
                            <FaShoppingCart className="mr-2 inline" />
                            Add to Cart
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                            Please login to add to cart
                          </div>
                        </div>

                        <div className="relative group">
                          <button
                            disabled
                            className="w-full px-6 py-3 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-xl font-bold shadow-lg opacity-70 cursor-not-allowed"
                          >
                            <FaShoppingCart className="mr-2 inline" />
                            {book.availability === "rent"
                              ? "Rent Now"
                              : "Buy Now"}
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                            Please login to{" "}
                            {book.availability === "rent" ? "rent" : "buy"}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : user?._id === book?.addedBy?._id ||
                  user?.id === book?.addedBy?._id ? (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Manage Your Listing
                    </h2>
                    <p className="text-gray-700 mb-4">
                      This book was listed by you. You can manage it from your
                      profile.
                    </p>
                    {book.forDonation ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                        <div className="flex items-center mb-2">
                          <FaHandHoldingHeart className="text-green-500 w-5 mr-2" />
                          <span className="text-green-700 font-medium">
                            Donation Book
                          </span>
                        </div>
                        <p className="text-gray-700">
                          You've listed this book for donation.
                        </p>
                      </div>
                    ) : (
                      <div className="relative group">
                        <button
                          disabled
                          className="w-full px-6 py-3 mb-3 rounded-3xl text-white text-xl font-bold shadow-lg bg-blue-400 cursor-not-allowed opacity-70"
                        >
                          <FaShoppingCart className="mr-2 inline" />
                          Add to Cart
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                          You cannot purchase your own book
                        </div>
                      </div>
                    )}

                    {!book.forDonation && (
                      <div className="relative group">
                        <button
                          disabled
                          className="w-full px-6 py-3 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-xl font-bold shadow-lg opacity-70 cursor-not-allowed"
                        >
                          <FaShoppingCart className="mr-2 inline" />
                          {book.availability === "rent"
                            ? "Rent Now"
                            : "Buy Now"}
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                          You cannot purchase your own book
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {book.forDonation
                        ? "Donation Request"
                        : "Delivery Information"}
                    </h2>

                    {book.forDonation ? (
                      <div className="mb-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                          <div className="flex items-center mb-2">
                            <FaHandHoldingHeart className="text-green-500 w-5 mr-2" />
                            <span className="text-green-700 font-medium">
                              This book is available for donation
                            </span>
                          </div>
                          <p className="text-gray-700">
                            This book is being generously offered by{" "}
                            {book?.addedBy?.profile?.firstName || "the owner"}.
                            You can request it for free.
                          </p>
                        </div>

                        <button
                          className="w-full px-6 py-3 bg-gradient-to-t from-green-600 to-green-500 rounded-3xl text-white text-xl font-bold shadow-lg transition-colors duration-300 ease-in-out hover:bg-gradient-to-t hover:from-green-700 hover:to-green-600"
                          onClick={() =>
                            navigate("/contact", { state: { book } })
                          }
                        >
                          <FaHandHoldingHeart className="mr-2 inline" />
                          Contact Us
                        </button>

                        <p className="mt-4 text-sm text-gray-600">
                          By requesting this book, you agree to pay the delivery
                          charge of ₹50.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center mb-3">
                          <FaTruck className="text-gray-400 w-5 mr-2" />
                          <span className="text-gray-700">
                            Delivery Charge: ₹50 on all orders
                          </span>
                        </div>
                        {book.availability !== "rent" && (
                          <div className="mb-3">
                            <span className="text-gray-700">
                              No return policy is available.
                            </span>
                          </div>
                        )}

                        {book.availability !== "rent" && (
                          <button
                            onClick={handleAddToCart}
                            disabled={isCartLoading}
                            className={`w-full px-6 py-3 mb-3 rounded-3xl text-white text-xl font-bold shadow-lg transition-colors duration-300 ease-in-out ${
                              !isInCart
                                ? "bg-gradient-to-t from-blue-500 to-blue-600 hover:bg-gradient-to-t hover:from-blue-600 hover:to-blue-500"
                                : "bg-gray-400"
                            }`}
                          >
                            {isCartLoading ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaShoppingCart className="mr-2 inline" />
                                {isInCart
                                  ? "Remove from Cart"
                                  : "Add to Cart"}
                              </>
                            )}
                          </button>
                        )}

                        <button
                          className="w-full px-6 py-3 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-xl font-bold shadow-lg transition-colors duration-300 ease-in-out hover:bg-gradient-to-t hover:from-secondaryColor hover:to-primaryColor cursor-not-allowed"
                          onClick={handleBuy}
                          disabled
                          title="This feature is not available yet"
                        >
                          <FaShoppingCart className="mr-2 inline" />
                          {book.availability === "rent"
                            ? "Rent Now"
                            : "Buy Now"}
                        </button>

                        {book.availability === "rent" && (
                          <p className="mt-4 text-sm text-gray-600">
                            Enjoy reading with our flexible rental option. Rent
                            the book for ₹{book.perWeekPrice}/week and return it
                            anytime!
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDescPage;
