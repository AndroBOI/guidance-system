import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null) => {
  console.log('Processing queue, items:', failedQueue.length);
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    console.log('Success:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.log('Error intercepted:', {
      url: error.config?.url,
      status: error.response?.status,
      hasRetry: error.config?._retry,
    });

    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      console.log('Skipping refresh (not 401 or already retried)');
      return Promise.reject(error);
    }

    console.log('401 detected! Attempting refresh...');

  
    if (isRefreshing) {
      console.log('Already refreshing, adding to queue...');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          console.log('Retrying queued request:', originalRequest.url);
          return api(originalRequest);
        })
        .catch((err) => {
          console.log('Queued request failed:', err);
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log('Calling /auth/refresh...');
      await api.post("/auth/refresh");
      console.log('Refresh successful!');
      
      processQueue(null);
      isRefreshing = false;

      console.log('Retrying original request:', originalRequest.url);
      return api(originalRequest);
    } catch (refreshError) {
      console.log('Refresh failed:', refreshError);
      
      processQueue(refreshError as Error);
      isRefreshing = false;

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.log('Redirecting to login...');
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;