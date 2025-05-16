import { searchBookAPI } from "@/api/book";

export const homeSearchBook = async (searchFields) => {
  try {
    const params = new URLSearchParams();

    if (searchFields.title) {
      params.append("title", searchFields.title);
    }

    if (searchFields.author) {
      params.append("author", searchFields.author);
    }

    if (searchFields.year) {
      params.append("publishYear", searchFields.year);
    }
    
    if (searchFields.query) {
      params.append("query", searchFields.query);
    }
    
    if (searchFields.page) {
      params.append("page", searchFields.page);
    }
    
    params.append("limit", searchFields.limit || 6);

    const response = await searchBookAPI(params.toString());
    
    return response.data;
    
  } catch (error) {
    console.error("Error searching books:", error);
    throw error;
  }
};
