import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
// API_URL me "/api" suffix hota hai — uploaded images "/uploads/..." isi server ke origin se aati hain
export const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Product.image me kabhi full URL (http...) hoti hai (jaise purani entries), kabhi hamare
// apne /uploads/xyz.jpg wale relative path — dono cases ko sahi <img src> me convert karta hai
export const resolveImageUrl = (image) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${SERVER_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
};

const api = axios.create({ baseURL: API_URL });

// Har request me agar token hai to Authorization header lagao
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
