import React, { useEffect, useState } from "react";
import {
  getCartApi,
  updateCartApi,
  // removeFromCartApi,
  moveToWishlistApi,
  removeToCartApi,
} from "@/api/cart";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrash2,
  FiMapPin,
  FiShoppingCart,
  FiEye,
  FiHeart,
  FiCheck,
  FiShoppingBag,
} from "react-icons/fi";
import CartSkeleton from "./CartSkeleton";
import BillingDetailsModal from "./BillingDetailsModal";
import PrimaryBtn from "@/components/PrimaryBtn";
import { useCartStore } from "@/store/useCartStore";
import { useIsSaved } from "@/hooks/useSaveLater";
import { saveForLaterApi } from "@/api/saveForLater";
import { toast } from "sonner";
import { addAddressApi } from "@/api/auth";
import getErrorMessage from "@/utils/getErrorMsg";
import { useAuthStore } from "@/store/useAuthStore";

const SHIPPING_FEE_PER_SELLER = 100;
const MAX_ADDRESSES = 2;

const CartPage = () => {
  const navigate = useNavigate();

  //   const [cartData, setCartData] = useState(null);
  const [isWishlistDialogOpen, setIsWishlistDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  //   const [isLoading, setIsLoading] = useState(true);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const {
    fetchCart,
    cart: cartData,
    loading: isLoading,
    decCart,
    cartCount: cCnt,
  } = useCartStore();

  const { fetchAddress, adLoading, adError, addresses, user, token } =
    useAuthStore();

  let cartCount = typeof cCnt === "function" ? cCnt() : cCnt;

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchAddress();
    }
  }, [user, fetchCart, fetchAddress]);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setUserAddresses(addresses);

      if (selectedAddressIndex >= addresses.length) {
        setSelectedAddressIndex(addresses.length - 1);
      }
    }
  }, [addresses]);

  const fetchUserAddresses = async () => {
    setIsAddressLoading(true);
    try {
      await fetchAddress();
      setUserAddresses(addresses);
    } catch (error) {
      console.error("Error fetching user addresses: ", error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      await removeToCartApi(bookId);
      decCart(cartCount);
      await fetchCart();
      toast.success("Book removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleMoveToWishlist = async () => {
    if (currentBook) {
      try {
        if (!(await useIsSaved(currentBook.bookId._id))) {
          await saveForLaterApi(currentBook.bookId._id);
        }
        await removeToCartApi(currentBook.bookId._id);
        decCart(cartCount);
        await fetchCart();
        toast.success("Book added to wishlist");
      } catch (error) {
        console.error("Error moving to wishlist:", error);
      } finally {
        setIsWishlistDialogOpen(false);
      }
    }
  };

  const calculateTotal = () => {
    return cartData?.totalPrice || 0;
  };

  const prepareCheckoutData = () => {
    const checkoutData = {
      cart: cartData.cart,
      total: calculateTotal(),
      selectedAddressIndex,
      address: userAddresses[selectedAddressIndex],
    };

    return checkoutData;
  };

  const shipFEEE = (cartData?.carts?.length || 0) * SHIPPING_FEE_PER_SELLER;

  console.log(shipFEEE);

  const handleCheckout = () => {
    if (userAddresses.length === 0) {
      toast.error(
        "Please add a shipping address before proceeding to checkout."
      );
      return;
    }

    navigate("/billing", {
      state: {
        address: userAddresses[selectedAddressIndex],
        shippingCharge: shipFEEE,
      },
    });
  };

  const handleBillingSubmit = async (billingData) => {
    try {
      if (userAddresses.length >= MAX_ADDRESSES) {
        toast.error(
          "You've reached the maximum number of addresses. Please delete an address to add a new one."
        );
        return;
      }

      setIsAddingAddress(true);

      // Add address via API
      await addAddressApi(billingData);

      // Fetch the updated addresses
      await fetchAddress();

      // Create a new temporary array with the new address included
      const updatedAddresses = [...userAddresses, billingData];

      // Update state immediately to show the new address
      setUserAddresses(updatedAddresses);

      // Select the newly added address (it will be the last one in the array)
      setSelectedAddressIndex(updatedAddresses.length - 1);

      // Close the modal
      setIsBillingModalOpen(false);

      toast.success("Address added successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Error adding address: ", error);
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleAddressSelection = (index) => {
    setSelectedAddressIndex(index);
    setIsAddressDialogOpen(false);
  };

  const handleDeleteAddress = async (index) => {
    try {
      const updatedAddresses = userAddresses.filter((_, i) => i !== index);
      setUserAddresses(updatedAddresses);
      if (selectedAddressIndex === index) {
        setSelectedAddressIndex(0);
      } else if (selectedAddressIndex > index) {
        setSelectedAddressIndex(selectedAddressIndex - 1);
      }
    } catch (error) {
      console.error("Error deleting address: ", error);
    }
  };

  if (isLoading && adLoading) {
    return <CartSkeleton />;
  }

  const hasItems = cartData?.carts && cartData.carts.length > 0;

  const totalItems =
    cartData?.carts?.reduce((total, cart) => {
      return total + cart.books.reduce((sum, book) => sum + book.quantity, 0);
    }, 0) || 0;

  const hasUnavailableBooks = () => {
    return cartData?.carts?.some((cart) =>
      cart.books.some((book) => book.bookId.status !== "available")
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {hasItems ? (
        <>
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3">
              <div className="bg-greyColor shadow-lg rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-medium text-gray-700">
                    {totalItems} ITEM{totalItems !== 1 ? "S" : ""} IN YOUR CART
                  </h2>
                </div>
                <div className="space-y-6">
                  {cartData?.carts?.map((cart) => (
                    <div
                      key={cart._id}
                      className="bg-white rounded-lg p-4 shadow"
                    >
                      <h2 className="text-lg font-semibold pb-2 capitalize flex items-center border-b border-gray-300">
                        {/* Seller {cart.sellerId._id.slice(-5)} */}
                        <FiShoppingBag /> &nbsp;&nbsp;
                        {cart.sellerId.profile.userName}
                      </h2>
                      {cart.books.map((book) => (
                        <div
                          key={book._id}
                          className="flex items-center space-x-4 py-4 border-b last:border-b-0"
                        >
                          <img
                            src={book.bookId.images[0]}
                            alt={book.bookId.title}
                            className="w-20 h-28 object-cover rounded-md"
                          />
                          <div className="flex-grow">
                            <h3 className="font-medium text-lg">
                              {book.bookId.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              {book.bookId.author}
                            </p>
                            <p className="font-semibold text-lg">
                              ₹{book.currentPrice} x {book.quantity}
                            </p>
                            {book.bookId.status !== "available" && (
                              <p className="text-red-500 text-sm font-medium mt-1">
                                This book is not available
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setCurrentBook(book);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-500 hover:text-red-700 transition duration-300"
                              title="Remove from cart"
                            >
                              <FiTrash2 size={20} />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentBook(book);
                                setIsWishlistDialogOpen(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 transition duration-300"
                              title="Move to wishlist"
                            >
                              <FiHeart size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="mt-3 text-right text-sm font-medium">
                        Subtotal: ₹{cart.subtotal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <div className="sticky top-24">
                <div className="bg-greyColor shadow-lg rounded-2xl overflow-hidden">
                  <div className="p-6 border-b-2 text-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">
                        Delivery Address
                      </h2>
                      {/* {console.log(userAddresses)} */}
                      {userAddresses && (
                        <button
                          className="text-blue-500 hover:underline text-sm flex items-center"
                          onClick={() => setIsAddressDialogOpen(true)}
                        >
                          <FiEye className="mr-1" />
                          View All
                        </button>
                      )}
                    </div>
                    {userAddresses && userAddresses.length > 0 ? (
                      <div className="text-sm">
                        <p className="font-medium">{`${
                          userAddresses[selectedAddressIndex]?.firstName || ""
                        } ${
                          userAddresses[selectedAddressIndex]?.lastName || ""
                        } (${
                          userAddresses[selectedAddressIndex]?.phone || ""
                        })`}</p>
                        <p>{`${
                          userAddresses[selectedAddressIndex]?.landmark || ""
                        }, ${
                          userAddresses[selectedAddressIndex]?.town || ""
                        }`}</p>
                        <p>
                          {userAddresses[selectedAddressIndex]?.street || ""}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="flex items-center text-sm cursor-pointer text-blue-500 hover:text-blue-700 transition duration-300"
                        onClick={() => setIsBillingModalOpen(true)}
                      >
                        <FiMapPin className="mr-2" />
                        <span>Add Shipping Address</span>
                      </div>
                    )}
                    {userAddresses.length > 0 &&
                      userAddresses.length < MAX_ADDRESSES && (
                        <button
                          className="text-blue-500 hover:underline mt-4 text-sm flex items-center"
                          onClick={() => setIsBillingModalOpen(true)}
                        >
                          <FiMapPin className="mr-1" />
                          Add New Address
                        </button>
                      )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Order Summary
                    </h2>
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>₹{cartData.calculatedTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span>₹{cartData.discount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span>
                          ₹{shipFEEE}
                          <span className="text-[12px]">
                            ({cartData?.carts?.length}x{SHIPPING_FEE_PER_SELLER}
                            )
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 mb-6">
                      <input
                        type="text"
                        placeholder="Enter Voucher Code"
                        className="flex-grow text-sm border p-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="rounded-3xl bg-gradient-to-t from-primaryColor to-secondaryColor text-white font-bold shadow-lg px-3 sm:px-4 py-2 transition duration-200 whitespace-nowrap text-sm">
                        APPLY
                      </button>
                    </div>
                    {hasUnavailableBooks() && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        <p className="font-medium">
                          Some items in your cart are no longer available
                        </p>
                        <p>
                          Please remove these items to proceed with checkout.
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg mb-6">
                      <span>Total</span>
                      <span>
                        ₹
                        {cartData.calculatedTotal +
                          cartData.carts.length * SHIPPING_FEE_PER_SELLER}
                      </span>
                    </div>
                    <button
                      className={`w-full py-3 transition duration-300 flex items-center justify-center ${
                        hasUnavailableBooks()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-t from-primaryColor to-secondaryColor"
                      } rounded-3xl text-white text-xl font-bold shadow-lg`}
                      disabled={isLoading || hasUnavailableBooks()}
                      onClick={handleCheckout}
                    >
                      <FiShoppingCart className="mr-2" />
                      PROCEED TO CHECKOUT ({totalItems})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 h-[60vh] flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-6">
            <FiShoppingCart className="text-6xl mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Link to={"/"}>
            <PrimaryBtn
              name={
                <>
                  <FiShoppingCart className="mr-2" />
                  Continue Shopping
                </>
              }
              disabled={hasUnavailableBooks()}
            />
          </Link>
        </div>
      )}
      {/* {console.log(hasUnavailableBooks(),"hasUnavailableBooks")} */}

      {isWishlistDialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs  flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Move to Wishlist</h2>
            <p className="mb-6">
              Are you sure you want to move this item to your wishlist?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-300 text-sm"
                onClick={() => setIsWishlistDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm flex items-center bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white"
                onClick={handleMoveToWishlist}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Moving..."
                ) : (
                  <>
                    <FiHeart className="mr-2" />
                    Move to Wishlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-300 text-sm"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 text-sm flex items-center"
                onClick={() => handleRemoveItem(currentBook.bookId._id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Deleting..."
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddressDialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs  flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Your Addresses</h2>
            {userAddresses.map((address, index) => (
              <div
                key={index}
                className={`p-4 mb-4 cursor-pointer rounded-lg transition duration-300 ${
                  index === selectedAddressIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div onClick={() => handleAddressSelection(index)}>
                    <p className="font-medium">{`${address.firstName} ${address.lastName} (${address.phone})`}</p>
                    <p className="text-sm text-gray-600">{`${address.landmark}, ${address.town}`}</p>
                    <p className="text-sm text-gray-600">
                      {address.streetAddress}
                    </p>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 transition duration-300"
                    onClick={() => handleDeleteAddress(index)}
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 transition duration-300 flex items-center bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white"
                onClick={() => setIsAddressDialogOpen(false)}
              >
                <FiCheck className="mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <BillingDetailsModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onSubmit={handleBillingSubmit}
        isSubmitting={isAddingAddress}
      />
    </div>
  );
};
export default CartPage;
