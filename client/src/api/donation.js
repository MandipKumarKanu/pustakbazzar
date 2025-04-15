import { baseURL, customAxios } from "@/config/axios";
import axios from "axios";

export async function getLatestDonation() {
  let url = "donation/latest-donations";
  return axios.get(`${baseURL}${url}`);
}

export async function getPendingonation() {
  let url = "donation/all-donations";
  return await customAxios.get(`${baseURL}${url}`);
}

export async function changeDonationStatus(id, status) {
  let url = `donation/update-status/${id}`;
  return await customAxios.patch(`${baseURL}${url}`, {
    status,
  });
}
