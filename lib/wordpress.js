import axios from 'axios';

const WP_API_URL = process.env.WORDPRESS_API_URL;

export const wpAPI = axios.create({
  baseURL: WP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getMeetings() {
  try {
    const response = await wpAPI.get('/meetings');

    // Make sure the response is JSON
    if (!Array.isArray(response.data)) {
      console.warn('Unexpected data format from WordPress:', response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error.message || error);
    return [];
  }
}

export async function getForms() {
  try {
    const response = await wpAPI.get('/forms');

    if (!Array.isArray(response.data)) {
      console.warn('Unexpected data format from WordPress:', response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching forms:', error.message || error);
    return [];
  }
}
