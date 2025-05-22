import { API_CONFIG } from "./apiConfig";

// helper function to get authentication headers
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

// helper function to handle responses and errors
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

// fetch a user profile
export const fetchProfile = async (name, token) => {
  if (!name || !token) {
    throw new Error("Name and token are required to fetch profile.");
  }

  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.PROFILES}/${name}?_bookings=true&_venues=true`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );
    return await handleApiResponse(response, "Failed to fetch profile");
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// update a user profile
export const updateProfile = async (name, token, updates) => {
  try {
    const response = await fetch(`${API_CONFIG.ENDPOINTS.PROFILES}/${name}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    });
    return await handleApiResponse(response, "Failed to update profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// register
export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.AUTH_REGISTER, {
      method: "POST",
      headers: getAuthHeaders(null, false),
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        venueManager: userData.venueManager || false,
      }),
    });
    const data = await handleApiResponse(response, "Failed to register user");
    return { success: true, data };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
};

// login to get token and user data
export const loginUser = async (credentials) => {
  try {
    const loginResponse = await fetch(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const loginResult = await handleApiResponse(
      loginResponse,
      "Failed to login"
    );
    const token = loginResult.data.accessToken;
    const userName = loginResult.data.name;

    if (!token || !userName) {
      throw new Error("Invalid login response: Missing token or username");
    }

    // fetch full profile data
    const profileData = await fetchProfile(userName, token);

    const user = {
      accessToken: token,
      name: profileData.name,
      email: profileData.email,
      bio: profileData.bio || "",
      avatar: profileData.avatar || { url: "", alt: "" },
      banner: profileData.banner || { url: "", alt: "" },
      venueManager: profileData.venueManager || false,
      venues: profileData.venues || [],
      bookings: profileData.bookings || [],
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { success: true, data: user };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, error: error.message };
  }
};

// fetch all profiles
export const fetchProfiles = async () => {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.PROFILES, {
      method: "GET",
      headers: getAuthHeaders(null, false),
    });
    return await handleApiResponse(response, "Failed to fetch profiles");
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
};

// search profiles
export const searchProfiles = async (query) => {
  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.PROFILES}/search?q=${query}`,
      {
        method: "GET",
        headers: getAuthHeaders(null, false),
      }
    );
    return await handleApiResponse(response, "Failed to search profiles");
  } catch (error) {
    console.error("Error searching profiles:", error);
    return [];
  }
};

// fetch venues for a profile
export const fetchProfileVenues = async (name) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to fetch profile venues.",
    };
  }

  try {
    const profile = await fetchProfile(name, token);
    return { success: true, data: profile.venues || [] };
  } catch (error) {
    console.error("Error fetching profile venues:", error);
    return { success: false, error: error.message };
  }
};

// fetch bookings for a profile
export const fetchProfileBookings = async (name) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to fetch profile bookings.",
    };
  }

  try {
    const profile = await fetchProfile(name, token);
    return { success: true, data: profile.bookings || [] };
  } catch (error) {
    console.error("Error fetching profile bookings:", error);
    return { success: false, error: error.message };
  }
};

// fetch a specific venue by id
export const fetchVenueById = async (venueId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.VENUES}/${venueId}?_bookings=true`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );
    return await handleApiResponse(response, "Failed to fetch venue");
  } catch (error) {
    console.error("Error fetching venue:", error);
    throw error;
  }
};

// create a booking
export const createBooking = async (bookingData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return { success: false, error: "You must be logged in to book a venue." };
  }

  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.BOOKINGS, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(bookingData),
    });
    const data = await handleApiResponse(response, "Failed to create booking");
    return { success: true, data };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
};

// fetch a booking by id
export const fetchBookingById = async (bookingId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to fetch a booking.",
    };
  }

  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}`,
      {
        method: "GET",
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleApiResponse(response, "Failed to fetch booking");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return { success: false, error: error.message };
  }
};

// update a booking
export const updateBooking = async (bookingId, bookingData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to update a booking.",
    };
  }

  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify(bookingData),
      }
    );
    const data = await handleApiResponse(response, "Failed to update booking");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { success: false, error: error.message };
  }
};

// delete a booking
export const deleteBooking = async (bookingId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to delete a booking.",
    };
  }

  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(token),
      }
    );
    await handleApiResponse(response, "Failed to delete booking");
    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error.message };
  }
};

// create a venue
export const createVenue = async (venueData) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return {
      success: false,
      error: "You must be logged in to create a venue.",
    };
  }

  if (!user || !user.venueManager) {
    return {
      success: false,
      error: "You must be a venue manager to create a venue.",
    };
  }

  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.VENUES, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(venueData),
    });
    const data = await handleApiResponse(response, "Failed to create venue");
    return { success: true, data };
  } catch (error) {
    console.error("Error creating venue:", error);
    return { success: false, error: error.message };
  }
};

// update a venue
export const updateVenue = async (venueId, venueData) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return {
      success: false,
      error: "You must be logged in to update a venue.",
    };
  }

  if (!user || !user.venueManager) {
    return {
      success: false,
      error: "You must be a venue manager to update a venue.",
    };
  }

  try {
    const response = await fetch(`${API_CONFIG.ENDPOINTS.VENUES}/${venueId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(venueData),
    });
    const data = await handleApiResponse(response, "Failed to update venue");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating venue:", error);
    return { success: false, error: error.message };
  }
};

// delete a venue
export const deleteVenue = async (venueId) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return {
      success: false,
      error: "You must be logged in to delete a venue.",
    };
  }

  if (!user || !user.venueManager) {
    return {
      success: false,
      error: "You must be a venue manager to delete a venue.",
    };
  }

  try {
    const response = await fetch(`${API_CONFIG.ENDPOINTS.VENUES}/${venueId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    await handleApiResponse(response, "Failed to delete venue");
    return { success: true };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return { success: false, error: error.message };
  }
};

// fetch all venues
export const fetchVenues = async () => {
  try {
    const response = await fetch(API_CONFIG.ENDPOINTS.VENUES, {
      method: "GET",
      headers: getAuthHeaders(null, true),
    });
    return await handleApiResponse(response, "Failed to fetch venues");
  } catch (error) {
    console.error("Error fetching venues:", error);
    return [];
  }
};
