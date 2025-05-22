const API_BASE = "https://v2.api.noroff.dev";
const API_KEY = "e91a1880-1d99-40a4-a44a-c3d808c11cb0";

const API_ENDPOINTS = {
  HOLIDAZE: `${API_BASE}/holidaze`,
  AUTH: `${API_BASE}/auth`,
  AUTH_REGISTER: `${API_BASE}/auth/register`,
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  PROFILES: `${API_BASE}/holidaze/profiles`,
  BOOKINGS: `${API_BASE}/holidaze/bookings`,
  VENUES: `${API_BASE}/holidaze/venues`,
};

export const API_CONFIG = {
  BASE: API_BASE,
  KEY: API_KEY,
  ENDPOINTS: API_ENDPOINTS,
};
