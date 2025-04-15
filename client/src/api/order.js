import { baseURL, customAxios } from "@/config/axios";

export async function approveRejectOrder(id, action, reasone) {
  let url = `order/seller/order/approve-reject`;
  return await customAxios.patch(`${baseURL + url}`, {
    orderId: id,
    status: action,
    reasone,
  });
}

export async function getOrderForAdmin() {
  return await customAxios.get("order/admin");
}

export async function updateOrderStatusApi(orderId, status) {
  return await customAxios.patch("order/update-status", {
    orderId,
    status,
  });
}
