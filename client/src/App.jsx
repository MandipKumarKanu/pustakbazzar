import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import ClickSpark from "./components/ClickSpark/ClickSpark";
import { Pointer } from "./components/magicui/pointer";
import useResetScrollPosition from "./hooks/useResetScrollPosition";
import Footer from "./components/Footer";
import GotoTop from "./components/GoToTop";
import Auth from "./components/Auth";
import { customAxios, setupInterceptors } from "./config/axios";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "./store/useAuthStore";
import { jwtDecode } from "jwt-decode";
import AddBook from "./components/AddBook";
import { useCategoryStore } from "./store/useCategoryStore";
import AllBookPage from "./pages/AllBookPage";
import BookDescPage from "./pages/BookDescPage";
import UserPage from "./pages/UserPage";
import ProfilePage from "./pages/ProfilePage";
import CategoryPage from "./pages/CategoryPage";
import ParticularCategory from "./pages/ParticularCategory";
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminHome from "./pages/AdminHome";
import ManageCategory from "./pages/ManageCategory";
import ContactPage from "./pages/ContactPage";
import WishListPage from "./pages/WishListPage";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./store/useCartStore";
import Loader from "./components/Loader";
import MyBookPage from "./pages/MyBookPage";
import EditBookPage from "./pages/EditBookPage";
import BillingAndOrderSummary from "./components/BillingAndOrderSummary";
import PaymentVerification from "./components/PaymentVerification";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import MyOrders from "./pages/MyOrders";
import SellerOrder from "./pages/SellerOrder";
import { ProtectedRoute } from "./utils/protectedRoute";
import { SellerAdminProtectedRoute } from "./utils/protectedRoute";
import DonationPending from "./pages/DonationPending";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ManageUser from "./pages/AllUsers";
import AdminOrder from "./pages/AdminOrder";
import PayOut from "./pages/PayOut";
import { useLocalStorage } from "./hooks/useLocalStorage";
import SellerPayoutHistoryPage from "./pages/SellerPayoutHistoryPage";
import AdminBooks from "./pages/AdminBooks";
// import AdminOrder from "./pages/AdminOrder";

// import ContactPage from "./pages/ContactPage";

function App() {
  const location = useLocation();
  const { pathname } = location;
  const [loading, setLoading] = useState(true);
  useLocalStorage("interest", []);

  const { token, setUser, setToken, user } = useAuthStore();
  const { fetchCart } = useCartStore();

  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    setupInterceptors(() => token, setToken, setUser);
    fetchCategories();
  }, []);

  useResetScrollPosition(pathname);

  useEffect(() => {
    const fetchAccessToken = async () => {
      setLoading(true);
      try {
        const url = `auth/refresh/`;
        const response = await customAxios.get(`${url}`);
        const token = response.data.accessToken;
        const decodedUser = jwtDecode(token);
        if (token) {
          setUser(decodedUser);
          console.log(decodedUser);
          setToken(token);
          localStorage.setItem(
            "interest",
            JSON.stringify(decodedUser.interest)
          );

          fetchCart();
        }
      } catch (error) {
        localStorage.setItem("loggedIn", "");
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      fetchAccessToken();
    } else {
      setLoading(false);
    }
  }, [token, setToken, setUser]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {!pathname.includes("/admin") && <Navbar />}
      {/* <Pointer /> */}
      <div className="min-h-[100dvh]">
        <Routes>
          <Route
            path="/auth"
            element={user && token ? <Navigate to="/" replace /> : <Auth />}
          />
          <Route path="/" element={<HomePage />} />
          <Route path="" element={<ProtectedRoute />}>
            <Route path="/addbook" element={<AddBook />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/MyOrders" element={<MyOrders />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mybook" element={<MyBookPage />} />
            <Route path="/book/edit/:id" element={<EditBookPage />} />
            {/* <Route path="/users" element={<UserPage />} /> */}
            <Route path="/billing" element={<BillingAndOrderSummary />} />
            <Route path="/payment/verify/" element={<PaymentVerification />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/wishlist" element={<WishListPage />} />
          </Route>
          <Route path="/allbooks" element={<AllBookPage />} />
          <Route path="/book/:id" element={<BookDescPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:cname" element={<ParticularCategory />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route element={<SellerAdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/managecategory" element={<ManageCategory />} />
            <Route path="/admin/sellerorder" element={<SellerOrder />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route
              path="/admin/pendingDonation"
              element={<DonationPending />}
            />
            <Route path="/admin/allUsers" element={<ManageUser />} />
            <Route path="/admin/admin-order" element={<AdminOrder />} />
            <Route path="/admin/payout" element={<PayOut />} />
            <Route path="/admin/payout-history" element={<SellerPayoutHistoryPage />} />
            </Route>
          </Route>
        </Routes>
      </div>
      {!pathname.includes("/admin") && <Footer />} <GotoTop />
      <Toaster richColors />
    </>
  );
}

export default App;
