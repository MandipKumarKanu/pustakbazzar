import { baseURL, customAxios } from "@/config/axios";

export async function approveRejectOrder(id, action, reasone) {
  let url = `order/seller/order/approve-reject`;
  return await customAxios.patch(`${baseURL + url}`, {
    orderId: id,
    status: action,
    reasone,
  });
}

export async function getOrderForAdmin(status = "all", page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page,
    limit,
  });

  if (status !== "all") {
    queryParams.append("status", status);
  }

  return await customAxios.get(`order/admin?${queryParams.toString()}`);
}

export async function updateOrderStatusApi(orderId, status) {
  return await customAxios.patch("order/update-status", {
    orderId,
    status,
  });
}
