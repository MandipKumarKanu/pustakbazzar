import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { baseURL, customAxios } from "@/config/axios";
import {
  FiCreditCard,
  FiShoppingBag,
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
} from "react-icons/fi";
import { Wallet } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { loadStripe } from "@stripe/stripe-js";

const MAX_ADDRESSES = 5;

function BillingAndOrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, fetchAddress, adLoading, addresses } = useAuthStore();
  const uid = user?.id;

  const { fetchCart, cart: cartData, loading: isLoading } = useCartStore();

  // console.log("cartData", cartData);

  useEffect(() => {
    if (user) {
      fetchAddress();
      fetchCart();
    }
  }, [user]);

  const shippingCharge = location.state?.shippingCharge || {};
  const selectedBooks = cartData?.carts
    ? cartData.carts.flatMap((cart) =>
        cart.books.map((book) => ({
          id: book.bookId._id,
          bookName: book.bookId.title,
          author: book.bookId.author,
          sellingPrice: book.currentPrice,
          quantity: book.quantity,
        }))
      )
    : [];

  const subtotal = selectedBooks.reduce(
    (acc, book) => acc + book.sellingPrice * book.quantity,
    0
  );

  const shippingFee = shippingCharge;
  // const platformFee = subtotal * 0.1;
  const totalPayment = subtotal + shippingFee;

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("khalti");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);

  const generateOrderData = () => {
    if (!selectedBooks || !selectedAddress) return null;

    return {
      books: selectedBooks.map((book) => ({
        bookId: book.id,
        quantity: book.quantity,
        price: book.sellingPrice,
        title: book.bookName,
        author: book.author,
      })),
      shippingAddress: {
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        street: selectedAddress.street,
        province: selectedAddress.province,
        town: selectedAddress.town,
        landmark: selectedAddress.landmark,
        phone: selectedAddress.phone,
        email: selectedAddress.email,
      },
      paymentMethod,
      subtotal,
      total: totalPayment,
    };
  };

  const handlePaymentConfirm = async () => {
    const dataToSave = {
      shippingFee: shippingFee.toFixed(2),
      payment: paymentMethod,
      shippingAddress: {
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        street: selectedAddress.street,
        province: selectedAddress.province,
        town: selectedAddress.town,
        landmark: selectedAddress.landmark,
        phone: selectedAddress.phone,
        email: selectedAddress.email,
      },
    };
    localStorage.setItem("pendingOrder", JSON.stringify(dataToSave));

    if (paymentMethod === "khalti") {
      try {
        console.log(dataToSave);

        const res = await customAxios.post(`${baseURL}order/`, {
          ...dataToSave,
        });
        console.log(res);

        if (res.status === 201) {
          const result = res?.data?.khaltiResponse;
          window.location.href = result.payment_url;
        }
      } catch (error) {
        console.error("Payment initiation failed:", error);
        alert("Payment initiation failed. Please try again.");
      }
    } else if (paymentMethod === "stripe") {
      try {
        const stripe = await loadStripe(
          import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        );
        const body = {
          shippingFee: shippingFee.toFixed(2),
          products: cartData.carts,
          shippingAddress: {
            firstName: selectedAddress.firstName,
            lastName: selectedAddress.lastName,
            street: selectedAddress.street,
            province: selectedAddress.province,
            town: selectedAddress.town,
            landmark: selectedAddress.landmark,
            phone: selectedAddress.phone,
            email: selectedAddress.email,
          },
        };

        // console.log(body);

        const response = await customAxios.post(`order/stripe-checkout`, body);

        console.log(response)
        const { sessionId } = response.data;

        const stripeResponse = await stripe.redirectToCheckout({
          sessionId,
        });

        if (stripeResponse.error) {
          console.error("Stripe checkout error:", stripeResponse.error);
          alert("Failed to redirect to Stripe checkout. Please try again.");
        }
      } catch (error) {
        console.error("Failed to create order:", error);
        alert("There was an error processing your order. Please try again.");
      }
    }

    setIsPaymentDialogOpen(false);
  };

  const PaymentConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Confirm Payment</h3>
        <p className="mb-4">
          {paymentMethod === "credit" ? (
            <span className="flex items-center gap-2">
              <FiCreditCard /> Your credit balance of Rs.{" "}
              {totalPayment.toFixed(2)} will be deducted.
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wallet /> You will be redirected to the payment gateway to pay
              Rs. {totalPayment.toFixed(2)}.
            </span>
          )}
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => setIsPaymentDialogOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handlePaymentConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 container mx-auto">
      <div className="flex-1 bg-greyColor p-8 rounded-2xl shadow-lg h-fit">
        <div className="flex items-center mb-6 gap-4">
          <FiMapPin className="text-primaryColor text-2xl" />
          <h2 className="text-3xl font-bold">Billing Details</h2>
        </div>

        {adLoading ? (
          <div className="p-4 text-center">Loading addresses...</div>
        ) : addresses && addresses.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiUser /> First Name
                </label>
                <input
                  type="text"
                  value={selectedAddress?.firstName || ""}
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiUser /> Last Name
                </label>
                <input
                  type="text"
                  value={selectedAddress?.lastName || ""}
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-2">
                <FiHome /> Street Address
              </label>
              <input
                type="text"
                value={selectedAddress?.street || ""}
                readOnly
                className="w-full px-4 py-2 bg-transparent border border-black rounded-full focus:outline-none focus:border-primaryColor transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiMapPin /> Country
                </label>
                <input
                  type="text"
                  value="Nepal"
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiMapPin /> Province
                </label>
                <input
                  type="text"
                  value={selectedAddress?.province || ""}
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiMapPin /> Town/City
                </label>
                <input
                  type="text"
                  value={selectedAddress?.town || ""}
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiMapPin /> Landmark
                </label>
                <input
                  type="text"
                  value={selectedAddress?.landmark || ""}
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiPhone /> Phone
                </label>
                <input
                  type="tel"
                  value={selectedAddress?.phone || ""}
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <FiMail /> Email Address
                </label>
                <input
                  type="email"
                  value={selectedAddress?.email || ""}
                  readOnly
                  className="w-full bg-transparent border border-black px-4 py-2 rounded-full focus:outline-none focus:border-primaryColor transition"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p>No addresses found. Please add an address to continue.</p>
            <button
              className="mt-4 px-4 py-2 bg-primaryColor text-white rounded-full"
              onClick={() => navigate("/profile")}
            >
              Add Address
            </button>
          </div>
        )}
      </div>

      <div className="lg:w-1/3">
        <div className="bg-greyColor p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FiShoppingBag /> Your Order
          </h2>
          <div className="space-y-4">
            {selectedBooks.map((book) => (
              <div key={book.id} className="flex justify-between">
                <div className="w-1/2 flex flex-col">
                  <span
                    className="line-clamp-2 font-semibold"
                    title={book.bookName}
                  >
                    {book.bookName}
                  </span>
                  <span>{book.author}</span>
                </div>
                <div>{book.quantity}x</div>
                <div>Rs. {(book.sellingPrice * book.quantity).toFixed(2)}</div>
              </div>
            ))}

            <div className="w-full h-[2px] bg-primaryColor my-4"></div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Rs. {shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee:</span>
                <span>Rs. {0}</span>
              </div>

              <div className="w-full h-[2px] bg-primaryColor my-4"></div>

              <div className="flex justify-between font-semibold">
                <span>Total Payment:</span>
                <span>Rs. {totalPayment.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  disabled
                  // checked={paymentMethod === "credit"}
                  // onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                  style={{ accentColor: "#531D99" }}
                />
                <span className="flex items-center gap-2">
                  <FiCreditCard /> Direct Credit Transfer{" "}
                  <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="khalti"
                  checked={paymentMethod === "khalti"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                  style={{ accentColor: "#531D99" }}
                />
                <span className="flex items-center gap-2">
                  <Wallet /> Khalti
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                  style={{ accentColor: "#531D99" }}
                />
                <span className="flex items-center gap-2">
                  <Wallet /> Stripe
                </span>
              </label>
            </div>
          </div>
        </div>
        <button
          className="w-full py-3 mt-8 bg-gradient-to-t from-primaryColor to-secondaryColor rounded-full text-white text-lg font-bold shadow-lg hover:from-primaryColor hover:to-primaryColor transition flex items-center justify-center gap-2"
          onClick={() => {
            if (!selectedAddress) {
              alert("Please select a delivery address first.");
              return;
            }
            setIsPaymentDialogOpen(true);
          }}
          disabled={!selectedAddress}
        >
          <FiShoppingBag /> Place Order
        </button>
      </div>

      {isPaymentDialogOpen && <PaymentConfirmationDialog />}
    </div>
  );
}

export default BillingAndOrderSummary;
