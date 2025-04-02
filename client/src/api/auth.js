import axios from "axios";
import { baseURL, customAxios } from "../config/axios.js";

export async function appySeller(doc) {
  const url = "auth/seller";
  return customAxios.post(`/${url}`,{
    proofDoc: doc
  });
}

export async function authSignUp(data) {
  const url = "auth/register";
  return customAxios.post(`/${url}`, data);
}

export async function authSignIn(data) {
  const url = "auth/login";
  return customAxios.post(`/${url}`, data);
}

export async function blogByUserId(id) {
  const url = `blogs/author/${id}`;
  return axios.get(`${baseURL}/${url}`);
}

export async function updateUser(data) {
  const url = `auth/update`;
  return customAxios.patch(`/${url}`, data);
}

export async function updatePass(data) {
  const url = `auth/password`;
  return customAxios.patch(`/${url}`, data);
}

export async function addAddressApi(data) {
  const url = `auth/profile/address`;
  return customAxios.patch(`/${url}`, data);
}

export async function getAddressApi() {
  const url = `auth/profile/address`;
  return customAxios.get(`/${url}`);
}
