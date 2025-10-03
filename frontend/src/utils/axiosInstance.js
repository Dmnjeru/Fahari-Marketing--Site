// frontend/src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : "https://api.faharidairies.co.ke/api"),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});


export default axiosInstance;
