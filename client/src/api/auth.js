import axios from "axios";
import { baseURL, customAxios } from "../config/axios.js";

export async function appySeller(doc) {
  const url = "auth/seller";
  return await customAxios.post(`/${url}`, {
    proofDoc: doc,
  });
}

export async function authSignUp(data) {
  const url = "auth/register";
  return await customAxios.post(`/${url}`, data);
}

export async function authSignIn(data) {
  const url = "auth/login";
  return await customAxios.post(`/${url}`, data);
}

export async function blogByUserId(id) {
  const url = `blogs/author/${id}`;
  return axios.get(`${baseURL}/${url}`);
}

export async function updatePass(data) {
  const url = `auth/password`;
  return await customAxios.patch(`/${url}`, data);
}

export async function addAddressApi(data) {
  const url = `auth/profile/address`;
  return await customAxios.patch(`/${url}`, data);
}

export async function getAddressApi() {
  const url = `auth/profile/address`;
  return await customAxios.get(`/${url}`);
}

export async function getAllUsers() {
  const url = `auth/users`;
  return await customAxios.get(`/${url}`);
}

export async function getProfileApi() {
  const url = `auth/profile`;
  return await customAxios.get(`/${url}`);
}

export const updateProfileApi = async (profileData) => {
  return await customAxios.patch("auth/profile", profileData);
};

export const sellerToApproveApi = async (id) => {
  return await customAxios.post(`auth/seller/approve/${id}`);
};

export const sellerToRejectApi = async (id) => {
  return await customAxios.post(`auth/seller/reject/${id}`);
};

export const logoutApi = async (id) => {
  return await customAxios.post(`auth/logout`);
};
