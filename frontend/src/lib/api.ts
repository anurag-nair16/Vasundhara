import axios from 'axios';

// API base URL (change if needed)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------------------------------------------
// REQUEST INTERCEPTOR – Attach Token Automatically
// --------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vasundhara_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------------------------------
// RESPONSE INTERCEPTOR – Auto Refresh Token on 401
// --------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If 401 → try to refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('vasundhara_refresh_token');
        if (!refreshToken) {
          throw new Error("Refresh token missing");
        }

        // Refresh token request
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        // Save new access token
        const newAccess = res.data.access;
        localStorage.setItem("vasundhara_access_token", newAccess);

        // Update axios default header
        apiClient.defaults.headers.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        // Retry original API request
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed → logout user
        localStorage.removeItem('vasundhara_access_token');
        localStorage.removeItem('vasundhara_refresh_token');
        localStorage.removeItem('vasundhara_user');

        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
