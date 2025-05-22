import { API_CONFIG } from "./apiConfig";

const getAuthHeaders = (token = null, includeApiKey = true) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (includeApiKey) {
    headers["X-Noroff-API-Key"] = API_CONFIG.KEY;
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// helper function to handle api responses and errors
const handleApiResponse = async (
  response,
  errorMessagePrefix = "HTTP error"
) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `${errorMessagePrefix}: ${errorData.message || response.statusText}`
    );
  }
  const result = await response.json();
  return result.data || result;
};

// fetch a venue by id
export const fetchVenueById = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage.");
    return { success: false, error: "No authentication token available." };
  }

  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.VENUES}/${id}?_bookings=true`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleApiResponse(response, "Failed to fetch venue");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching venue:", error);
    return { success: false, error: error.message };
  }
};

// search venues or fetch all if no query
export const searchVenues = async (query = "") => {
  try {
    const url = query
      ? `${API_CONFIG.ENDPOINTS.VENUES}/search?q=${query}`
      : API_CONFIG.ENDPOINTS.VENUES;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(null, false),
    });
    return await handleApiResponse(response, "Failed to search venues");
  } catch (error) {
    console.error("Error searching venues:", error);
    return [];
  }
};
