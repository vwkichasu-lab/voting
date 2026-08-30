import axios from 'axios';

const baseURL = import.meta.env.REACT_APP_API_BASE_URL || '/api';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

client.interceptors.request.use((config) => {
  const studentSession = localStorage.getItem('voting_session_id');
  const adminToken = localStorage.getItem('voting_admin_token');
  const token = studentSession || adminToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    if (data && data.message) {
      error.userMessage = data.message;
    }
    return Promise.reject(error);
  }
);

export default client;
