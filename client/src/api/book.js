import { baseURL, customAxios } from "@/config/axios";
import axios from "axios";

export async function addBook(data) {
  let url = "book/";
  return customAxios.post(url, data);
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
  return axios.get(`${baseURL}${url}`);
}

export async function getBookByCateId(id) {
  let url = `book/category/${id}`;
  return axios.get(`${baseURL}${url}`);
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

export async function updateBook(id, data) {
  let url = `book/${id}`;
  return customAxios.patch(`${baseURL}${url}`, data);
}
