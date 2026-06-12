import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  validateStatus: (status) => status < 400,
  timeout: 10000,
});

// Lanyard API
export const fetchLanyardData = async (userId: string) => {
  const response = await api.get(`/lanyard/${userId}`);
  return response.data;
};

// Discord Profile API
export const fetchDiscordProfile = async (userId: string) => {
  const response = await api.get(`/discord/profile/${userId}`);
  return response.data;
};

// Last.fm API
export const fetchLastFmData = async () => {
  const response = await api.get('/lastfm/recent');
  return response.data;
};

// WakaTime API
export const fetchWakaTimeData = async () => {
  const response = await api.get('/wakatime/stats');
  return response.data;
};

// Auth API
export const getAuthUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response.data.user;
  } catch {
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    window.location.href = '/home';
  } catch (error) {
    console.error('Failed to log out:', error);
  }
};

// Contact API
export const sendDiscordMessage = async (message: string) => {
  const response = await api.post('/contact/discord', { message });
  return response.data;
};

export const sendEmail = async (name: string, email: string, subject: string, message: string) => {
  const response = await api.post('/contact/email', { name, email, subject, message });
  return response.data;
};

// GitHub Repos API
export const fetchGitHubRepos = async () => {
  const response = await api.get('/github/repos');
  return response.data;
};

// GitHub Code Snippets API
export const fetchGitHubCodeSnippets = async () => {
  const response = await api.get('/github/code-snippets');
  return response.data;
};

// System Specs API
export const fetchSystemSpecs = async () => {
  const response = await api.get('/system/specs');
  return response.data;
};

export default api;
