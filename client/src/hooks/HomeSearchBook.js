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

    params.append("limit", 20);

    const response = await searchBookAPI(params.toString());

    console.log(response.data.books)

   return response.data.books;
   
  } catch (error) {
    console.error("Error searching books:", error);
    throw error;
  }
};
