import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Critical for your Cookie-based backend
});

api.interceptors.response.use(
  (response) => response.data, // Return only data.data (or whatever structure sendSuccess uses)
  (error) => {
    // 1. Extract the specific message from your backend's sendError response
    // Typically sendError sends: { success: false, message: "Invalid Password" }
    const message = error.response?.data?.message || "Something went wrong";
    
    // 2. Reject the promise with JUST the message string
    // This makes it easy to display in UI without parsing objects later
    return Promise.reject(new Error(message));
  }
);