import axios from "axios";

const API = axios.create({
  baseURL:
    "https://5e18befc-a5ba-4b57-acce-9af020ac60ca-00-1mo04ryoq1rij.sisko.replit.dev/api",
});


// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export const BASE_URL =
  "https://5e18befc-a5ba-4b57-acce-9af020ac60ca-00-1mo04ryoq1rij.sisko.replit.dev/api";
export default API;
