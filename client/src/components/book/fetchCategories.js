import axios from 'axios';

  export async function fetchCategories() {
    try {
      const response = await axios.get('/api/categories');
      const categories = response.data.map(category => ({
        value: category._id,
        label: category.categoryName
      }));
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }