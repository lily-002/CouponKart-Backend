//../utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api", // Ensure this is correct and accessible
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default API;
