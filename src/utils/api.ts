import axios from 'axios';

// CRITICAL: Use /myhub/api/* paths to match Cloudflare tunnel routing
// Backend handles both /api/* and /myhub/api/*, but Cloudflare routes /myhub/* to backend
const getAbsoluteBaseURL = () => {
  if (typeof window !== 'undefined') {
    const base = `${window.location.protocol}//${window.location.host}/api`;
    console.log('[API] baseURL calculated:', base, 'from:', window.location.href);
    return base;
  }
  return '/api';
};

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  // Let axios handle status codes normally - throw on 4xx/5xx
  validateStatus: (status) => status < 400,
  timeout: 10000, // 10 second timeout
});

// Set baseURL dynamically at request time (ensures window.location is available)
api.interceptors.request.use((config) => {
  // Override baseURL dynamically
  const dynamicBaseURL = getAbsoluteBaseURL();
  config.baseURL = dynamicBaseURL;
  
  const fullUrl = config.baseURL + (config.url || '');
  console.log('[API Request]', config.method?.toUpperCase(), fullUrl);
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Simple response interceptor - just log, don't interfere
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Lanyard API - simplified: just fetch and return data
export const fetchLanyardData = async (userId: string) => {
  console.log('[API] fetchLanyardData called for userId:', userId);
  try {
    const response = await api.get(`/lanyard/${userId}`);
    console.log('[API] fetchLanyardData success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] fetchLanyardData error:', error.response?.status, error.message);
    throw error;
  }
};

// Discord Profile API - simplified: just fetch and return data
export const fetchDiscordProfile = async (userId: string) => {
  console.log('[API] fetchDiscordProfile called for userId:', userId);
  try {
    const response = await api.get(`/discord/profile/${userId}`);
    console.log('[API] fetchDiscordProfile success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] fetchDiscordProfile error:', error.response?.status, error.message);
    throw error;
  }
};

// Last.fm API - simplified: just fetch and return data
export const fetchLastFmData = async () => {
  console.log('[API] fetchLastFmData called');
  try {
    const response = await api.get('/lastfm/recent');
    console.log('[API] fetchLastFmData success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] fetchLastFmData error:', error.response?.status, error.message);
    throw error;
  }
};

// WakaTime API - simplified: just fetch and return data
export const fetchWakaTimeData = async () => {
  console.log('[API] fetchWakaTimeData called');
  try {
    const response = await api.get('/wakatime/stats');
    console.log('[API] fetchWakaTimeData success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] fetchWakaTimeData error:', error.response?.status, error.message);
    throw error;
  }
};

// Auth API
export const getAuthUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response.data.user;
  } catch (error) {
    console.error('Failed to fetch auth user:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    window.location.href = '/myhub/home';
  } catch (error) {
    console.error('Failed to logout:', error);
  }
};

// Contact API
export const sendDiscordMessage = async (message: string) => {
  try {
    const response = await api.post('/contact/discord', { message });
    return response.data;
  } catch (error) {
    console.error('Failed to send Discord message:', error);
    throw error;
  }
};

export const sendEmail = async (name: string, email: string, subject: string, message: string) => {
  try {
    const response = await api.post('/contact/email', { name, email, subject, message });
    return response.data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

// GitHub Repos API
export const fetchGitHubRepos = async () => {
  console.log('[API] fetchGitHubRepos called');
  try {
    const response = await api.get('/github/repos');
    console.log('[API] fetchGitHubRepos success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] fetchGitHubRepos error:', error.response?.status, error.message);
    throw error;
  }
};

// GitHub Code Snippets API
export const fetchGitHubCodeSnippets = async () => {
  console.log('[API] fetchGitHubCodeSnippets called');
  try {
    const response = await api.get('/github/code-snippets');
    console.log('[API] fetchGitHubCodeSnippets success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] fetchGitHubCodeSnippets error:', error.response?.status, error.message);
    throw error;
  }
};

// System Specs API
export const fetchSystemSpecs = async () => {
  console.log('[API] fetchSystemSpecs called');
  try {
    const response = await api.get('/system/specs');
    console.log('[API] fetchSystemSpecs success:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[API] fetchSystemSpecs error:', error.response?.status, error.message);
    throw error;
  }
};

export default api;


