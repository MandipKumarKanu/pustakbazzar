import { customAxios } from "@/config/axios";

export async function isSavedApi(id) {
  let url = `save/is-saved/${id}`;
  return await customAxios.get(url);
}

export async function saveForLaterApi(id) {
  let url = `save/${id}`;
  return await customAxios.post(url);
}

export async function removeSaveForLaterApi(id) {
  let url = `save/${id}`;
  return await customAxios.delete(url);
}

export async function getSaveForLaterApi() {
  let url = `save`;
  return await customAxios.get(url);
}
