import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.API_BASE_URL || "https://localhost:7061/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
