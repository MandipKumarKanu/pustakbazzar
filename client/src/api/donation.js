import { baseURL, customAxios } from "@/config/axios";
import axios from "axios";

export function getLatestDonation() {
  let url = "donation/latest-donations";
  return axios.get(`${baseURL}${url}`);
}

export function getPendingonation() {
  let url = "donation/all-donations";
  return customAxios.get(`${baseURL}${url}`);
}

export function changeDonationStatus(id, status) {
  let url = `donation/update-status/${id}`;
  return customAxios.patch(`${baseURL}${url}`, {
    status,
  });
}
