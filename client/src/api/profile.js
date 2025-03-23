import axios from "axios";
import { baseURL, customAxios } from "../config/axios";

export async function getBookBySeller(id) {
  const url = `book/seller/${id}`;
  return await axios.get(`${baseURL}${url}`);
}

export async function getMyBook() {
  const url = `auth/mybooks`;
  return await customAxios.get(`${baseURL}${url}`);
}
