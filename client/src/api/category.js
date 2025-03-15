import { customAxios } from "@/config/axios";

export async function getCategoryApi() {
  let url = "category/";
  return await customAxios.get(`${url}`);
}

export async function addCategory(categoryName) {
  let url = "category/";
  return await customAxios.post(`${url}`, {
    categoryName,
  });
}

export async function editCategoryApi(data) {
  let url = "category/";
  return await customAxios.patch(`${url}`, {
    ...data,
  });
}

export async function deleteCategoryApi(deleteId) {
  let url = "category/";
  return await customAxios.delete(`${url}${deleteId}`);
}
