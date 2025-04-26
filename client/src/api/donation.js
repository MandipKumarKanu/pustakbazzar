import { baseURL, customAxios } from "@/config/axios";
import axios from "axios";

export async function getLatestDonation() {
  let url = "donation/latest-donations";
  return axios.get(`${baseURL}${url}`);
}

export async function getAllDonation(page = 1, limit = 10, status = "all") {
  let url = `donation/all-donations?page=${page}&limit=${limit}`;
  
  if (status !== "all") {
    url += `&status=${status}`;
  }
  
  return await customAxios.get(`${baseURL}${url}`);
}

export async function getPendingDonation(page = 1, limit = 10) {
  let url = `donation/pending?page=${page}&limit=${limit}`;
  return await customAxios.get(`${baseURL}${url}`);
}

export async function changeDonationStatus(id, status, message = "") {
  let url = `donation/update-status/${id}`;
  return await customAxios.patch(`${baseURL}${url}`, {
    status,
    message
  });
}
