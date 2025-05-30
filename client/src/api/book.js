import { baseURL, customAxios } from "@/config/axios";
import axios from "axios";

export async function addBook(data) {
  let url = "book/";
  return await customAxios.post(url, data);
}

export async function getBooks(
  page = 1,
  limit = 30,
  order,
  minPrice = "",
  maxPrice = ""
) {
  let url = `book/get/?page=${page}&limit=${limit}`;
  if (minPrice) url += `&minPrice=${minPrice}`;
  if (maxPrice) url += `&maxPrice=${maxPrice}`;
  return axios.post(`${baseURL}${url}`, { order });
}

export async function getBookById(id) {
  let url = `book/${id}`;
  return customAxios.get(`${baseURL}${url}`);
}
export async function getBookByIdUser(id) {
  let url = `${baseURL}book/${id}`;
  // console.log("first")
  return await customAxios.get(url);
}

export function getBookByCateId(categoryId, params = {}) {
  const query = new URLSearchParams(params).toString();
  return axios.get(
    `${baseURL}book/category/${categoryId}${query ? `?${query}` : ""}`
  );
}

export async function searchBookAPI(param) {
  let url = `book/search?${param}`;
  return axios.get(`${baseURL}${url}`);
}

export async function incView(id) {
  let url = `book/inc/${id}`;
  return axios.patch(`${baseURL}${url}`);
}

export async function getWeeklyTopBook() {
  let url = `book/weeklytop`;
  return axios.get(`${baseURL}${url}`);
}
export async function getAuthor() {
  let url = `book/get-author`;
  return axios.get(`${baseURL}${url}`);
}

export async function updateBook(id, data) {
  let url = `book/${id}`;
  return await customAxios.patch(`${baseURL}${url}`, data);
}

export async function getRecommendation(categoryId) {
  let url = `book/recommendations`;
  return customAxios.post(`${baseURL}${url}`, categoryId);
}
