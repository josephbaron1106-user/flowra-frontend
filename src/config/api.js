/**
 * FLOWRA Global API Configuration
 * Automatically uses environment variable or defaults to production Render backend
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_PAYMENT_API_URL ||
  "https://flowra-backend-1.onrender.com"
).replace(/\/$/, "");

export default API_BASE_URL;
