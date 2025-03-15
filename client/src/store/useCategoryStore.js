import { getCategoryApi } from "@/api/category";
import { baseURL } from "@/config/axios";
import getErrorMessage from "@/utils/getErrorMsg";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";

export const useCategoryStore = create((set) => ({
  loading: false,
  error: null,
  category: [],

  fetchCategories: async () => {
    try {
      set({ category: [], loading: true, error: null });
      const response = await getCategoryApi();
      const category = response.data.categories.map((category) => ({
        value: category._id,
        label: category.categoryName,
      }));
      set({ category, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(getErrorMessage(error))
      set({ category: [], loading: false, error: error.message });
    }
  },
}));
