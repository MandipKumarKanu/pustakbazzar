import { baseURL } from "@/config/axios";
import axios from "axios";

export function getLatestDonation() {
  let url = "donation/latest-donations";
  return axios.get(`${baseURL}${url}`);
}
