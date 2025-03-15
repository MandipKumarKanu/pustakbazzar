import React, { useEffect, useState } from "react";
import {
  getCartApi,
  updateCartApi,
  removeFromCartApi,
  moveToWishlistApi,
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

const SHIPPING_FEE_PER_SELLER = 100;
const MAX_ADDRESSES = 5;

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

  const { fetchCart, cart: cartData, loading: isLoading } = useCartStore();
  console.log(cartData);

  useEffect(() => {
    fetchCart();
    fetchUserAddresses();
  }, []);

  //   const fetchCart = async () => {
  //     setIsLoading(true);
  //     try {
  //       const res = await getCartApi();
  //       setCartData(res.data);
  //     } catch (error) {
  //       console.error("Error fetching cart:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  const fetchUserAddresses = async () => {
    try {
      // Replace with your actual API call
      const addresses = []; // Get from your API
      if (addresses && addresses.length > 0) {
        setUserAddresses(addresses);
        setSelectedAddressIndex(0);
      }
    } catch (error) {
      console.error("Error fetching user addresses: ", error);
    }
  };

  const handleRemoveItem = async (bookId, cartId) => {
    setIsLoading(true);
    try {
      await removeFromCartApi(bookId);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveToWishlist = async () => {
    if (currentBook) {
      setIsLoading(true);
      try {
        await moveToWishlistApi(currentBook.bookId._id);
        await removeFromCartApi(currentBook._id);
        await fetchCart();
      } catch (error) {
        console.error("Error moving to wishlist:", error);
      } finally {
        setIsLoading(false);
        setIsWishlistDialogOpen(false);
      }
    }
  };

  const calculateTotal = () => {
    return cartData?.totalPrice || 0;
  };

  const handleUpdateQuantity = async (bookId, cartId, newQuantity) => {
    if (newQuantity < 1) return;

    setIsLoading(true);
    try {
      await updateCartApi(bookId, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleCheckout = () => {
    const checkoutData = prepareCheckoutData();
    navigate("/billing", { state: { checkoutData } });
  };

  const handleBillingSubmit = async (billingData) => {
    try {
      if (userAddresses.length >= MAX_ADDRESSES) {
        alert(
          "You've reached the maximum number of addresses. Please delete an address to add a new one."
        );
        return;
      }

      // Replace with your API call to add address
      // const response = await addAddressApi(billingData);

      await fetchUserAddresses();
      setSelectedAddressIndex(userAddresses.length);
      setIsBillingModalOpen(false);
    } catch (error) {
      console.error("Error adding address: ", error);
    }
  };

  const handleAddressSelection = (index) => {
    setSelectedAddressIndex(index);
    setIsAddressDialogOpen(false);
  };

  const handleDeleteAddress = async (index) => {
    try {
      const updatedAddresses = userAddresses.filter((_, i) => i !== index);

      // Replace with your API call to update addresses
      // await updateAddressesApi(updatedAddresses);

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

  if (isLoading) {
    return <CartSkeleton />;
  }

  const hasItems = cartData?.carts && cartData.carts.length > 0;

  const totalItems =
    cartData?.carts?.reduce((total, cart) => {
      return total + cart.books.reduce((sum, book) => sum + book.quantity, 0);
    }, 0) || 0;

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
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() =>
                                handleRemoveItem(book._id, cart._id)
                              }
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
                      {userAddresses.length > 0 && (
                        <button
                          className="text-blue-500 hover:underline text-sm flex items-center"
                          onClick={() => setIsAddressDialogOpen(true)}
                        >
                          <FiEye className="mr-1" />
                          View All
                        </button>
                      )}
                    </div>
                    {userAddresses.length > 0 ? (
                      <div className="text-sm">
                        <p className="font-medium">{`${userAddresses[selectedAddressIndex].firstName} ${userAddresses[selectedAddressIndex].lastName} (${userAddresses[selectedAddressIndex].phone})`}</p>
                        <p>{`${userAddresses[selectedAddressIndex].landmark}, ${userAddresses[selectedAddressIndex].town}`}</p>
                        <p>
                          {userAddresses[selectedAddressIndex].streetAddress}
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
                          ₹{cartData?.carts?.length * SHIPPING_FEE_PER_SELLER}
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
                    <div className="flex justify-between font-semibold text-lg mb-6">
                      <span>Total</span>
                      <span>
                        ₹
                        {cartData.totalPrice +
                          cartData.carts.length * SHIPPING_FEE_PER_SELLER}
                      </span>
                    </div>
                    <button
                      className="w-full py-3  transition duration-300  flex items-center justify-center bg-gradient-to-t from-primaryColor to-secondaryColor rounded-3xl text-white text-xl font-bold shadow-lg"
                      disabled={isLoading}
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
          <Link
            to={"/"}
            // className="px-8 py-3 bg-primaryColor text-white rounded-full hover:bg-blue-600 transition duration-300 flex items-center"
          >
            <PrimaryBtn
              name={
                <>
                  <FiShoppingCart className="mr-2" />
                  Continue Shopping
                </>
              }
            />
          </Link>
        </div>
      )}

      {isWishlistDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                onClick={() =>
                  handleRemoveItem(currentBook._id, currentBook.cartId)
                }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
      />
    </div>
  );
};
export default CartPage;
