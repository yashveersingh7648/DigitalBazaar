import axios from "axios";

// REACT_APP_API_URL sabse pehle use hoti hai (Render ke Environment Variables se, agar set hai).
// Lekin agar wo set nahi hai (ya build time par missing thi), to sirf tabhi "localhost" use karo
// jab aap sach me apne computer par local development kar rahe ho — kisi bhi live/production
// domain par ye automatically aapke real backend URL par fallback ho jaata hai, kabhi localhost
// try nahi karega (jo pehle "ERR_CONNECTION_REFUSED" wala bug de raha tha).
const isLocalDev =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const PRODUCTION_API_URL = "https://digitalbazaar-backend-1qdt.onrender.com/api";
const LOCAL_API_URL = "http://localhost:5000/api";

const API_URL = import.meta.env.REACT_APP_API_URL || (isLocalDev ? LOCAL_API_URL : PRODUCTION_API_URL);
export { API_URL };
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
