import { customAxios } from "@/config/axios";

export const getApprovedSellers = async (page = 1, limit = 10) => {
  return await customAxios.get(`admin/sellers?page=${page}&limit=${limit}`);
};

export const getSellerPayoutHistory = async (
  sellerId,
  page = 1,
  limit = 10
) => {
  return await customAxios.get(
    `payouts/${sellerId}/history?page=${page}&limit=${limit}`
  );
};
