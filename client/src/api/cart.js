import { baseURL, customAxios } from "@/config/axios";
import axios from "axios";

export async function addToCartApi(bookId) {
  let url = `cart/add/${bookId}`;
  return await customAxios.post(url);
}
export async function isInCartApi(bookId) {
  let url = `cart/incart/${bookId}`;
  return await customAxios.get(url);
}
export async function getCartApi() {
  let url = `cart/`;
  return await customAxios.get(url);
}
export async function removeToCartApi(bookId) {
  let url = `cart/remove/${bookId}`;
  return await customAxios.post(url);
}

export async function clearCartApi(bookId) {
  let url = `cart/clear/${bookId}`;
  return await customAxios.post(url);
}

export async function clearCartABySellerIdApi(sid) {
  let url = `cart/seller/${sid}`;
  return await customAxios.post(url);
}

export const updateCartApi = (bookId, quantity) => {
  return axios.put(`${baseURL}/cart/update`, {
    bookId,
    quantity,
  });
};

export const moveToWishlistApi = (bookId) => {
  return axios.post(`${baseURL}/wishlist/add`, {
    bookId,
  });
};

export const addAddressApi = (addressData) => {
  return axios.post(`${baseURL}/user/address`, addressData);
};

export const getUserAddressesApi = () => {
  return axios.get(`${baseURL}/user/addresses`);
};

export const deleteAddressApi = (addressId) => {
  return axios.delete(`${baseURL}/user/address/${addressId}`);
};
