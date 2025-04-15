import { create } from "zustand";
import { toast } from "sonner";
// import getErrorMessage from "../components/utils/getErrorMsg";
import { jwtDecode } from "jwt-decode";
import {
  authSignIn,
  authSignUp,
  getAddressApi,
  getProfileApi,
  logoutApi,
} from "@/api/auth";
import getErrorMessage from "@/utils/getErrorMsg";

export const useAuthStore = create((set) => ({
  loading: false,
  error: null,
  token: null,
  user: null,
  adLoading: true,
  adError: null,
  addresses: [],

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),

  login: async (email, password, navigate) => {
    set({ loading: true, error: null });
    try {
      const response = await authSignIn({ email, password });
      const token = response?.data?.accessToken;
      const decodedUser = jwtDecode(token);
      console.log(decodedUser);
      set({ loading: false, user: decodedUser, token });
      toast.success("Logged-in Successful");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
      set({ error: error, loading: false });
    }
  },

  signUp: async (data, navigate) => {
    set({ loading: true, error: null });
    try {
      const response = await authSignUp(data);
      const token = response?.data?.accessToken;
      console.log(token);
      const decodedUser = jwtDecode(token);
      set({ loading: false, user: decodedUser, token });
      toast.success(response.data.message);
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
      set({ error: error, loading: false });
    }
  },

  fetchAddress: async () => {
    set({ adLoading: true, adError: null });
    try {
      const response = await getAddressApi();
      set({ adLoading: false, addresses: response.data.addresses });
    } catch (error) {
      set({ adError: error, adLoading: false });
    }
  },

  logout: async () => {
    try {
      await logoutApi();
      set({ loading: false, user: null, token: null });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  getProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getProfileApi();
      console.log(response?.data);
      set({ loading: false, user: response?.data });
    } catch (error) {
      // toast.error(getErrorMessage(error));
      set({ error: error, loading: false });
    }
  },
}));
