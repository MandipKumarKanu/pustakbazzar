import { baseURL, customAxios } from "@/config/axios";
import axios from "axios";

export async function addToCartApi(bookId) {
  let url = `cart/add/${bookId}`;
  return customAxios.post(url);
}
export async function isInCartApi(bookId) {
  let url = `cart/incart/${bookId}`;
  return customAxios.get(url);
}
export async function getCartApi() {
  let url = `cart/`;
  return customAxios.get(url);
}
export async function removeToCartApi(bookId) {
  let url = `cart/remove/${bookId}`;
  return customAxios.post(url);
}

export async function clearCartApi(bookId) {
  let url = `cart/clear/${bookId}`;
  return customAxios.post(url);
}

export async function clearCartABySellerIdApi(sid) {
  let url = `cart/seller/${sid}`;
  return customAxios.post(url);
}

export const updateCartApi = (bookId, quantity) => {
  return axios.put(`${baseURL}/cart/update`, {
    bookId,
    quantity,
  });
};

// Remove item from cart
// export const removeFromCartApi = (bookId) => {
//   return axios.delete(`${baseURL}/cart/item/${bookId}`);
// };

// Move item to wishlist
export const moveToWishlistApi = (bookId) => {
  return axios.post(`${baseURL}/wishlist/add`, {
    bookId,
  });
};

// Add or update user address
export const addAddressApi = (addressData) => {
  return axios.post(`${baseURL}/user/address`, addressData);
};

// Get user addresses
export const getUserAddressesApi = () => {
  return axios.get(`${baseURL}/user/addresses`);
};

// Delete user address
export const deleteAddressApi = (addressId) => {
  return axios.delete(`${baseURL}/user/address/${addressId}`);
};
