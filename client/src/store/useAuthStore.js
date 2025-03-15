import { create } from "zustand";
import { toast } from "sonner";
// import getErrorMessage from "../components/utils/getErrorMsg";
import { jwtDecode } from "jwt-decode";
import { authSignIn, authSignUp } from "@/api/auth";
import getErrorMessage from "@/utils/getErrorMsg";

export const useAuthStore = create((set) => ({
  loading: false,
  error: null,
  token: null,
  user: null,

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

  logout: async () => {
    console.log("logout");
  },
}));
