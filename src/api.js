import axios from "axios";

const API = axios.create({
  baseURL: "https://cardgame-backend-production.up.railway.app/api",
});


// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export const BASE_URL = "https://cardgame-backend-production.up.railway.app/api";
export default API;
