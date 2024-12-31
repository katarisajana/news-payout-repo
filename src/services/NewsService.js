import axios from "axios";

const API_KEY = "28057d2b3b08471dbdf5ad97ef811c01";
const BASE_URL = "https://newsapi.org/v2/";

export const fetchNews = async ({ query = "general", from, to, pageSize = 100, sortBy = "publishedAt" }) => {
  try {
    const response = await axios.get(`${BASE_URL}everything`, {
      params: {
        q: query,       
        from,          
        to,             
        sortBy,         
        pageSize,       
        apiKey: API_KEY 
      },
    });
    return response.data.articles; 
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};
