import axios from "axios";

// Backend API runs on Express (see Backend/index.js -> PORT 3030)
export const BASE_URL = "https://linkdinwebsite.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
