import { baseURL, customAxios } from "@/config/axios";

export async function approveRejectOrder(id, action, reasone) {
  let url = `order/seller/order/approve-reject`;
  return customAxios.patch(`${baseURL + url}`, {
    orderId: id,
    status: action,
    reasone,
  });
}
