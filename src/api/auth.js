export const API_BASE = "https://v2.api.noroff.dev";
export const API_HOLIDAZE = `${API_BASE}/holidaze`;
export const API_AUTH = `${API_BASE}/auth`;
export const API_AUTH_REGISTER = `${API_AUTH}/register`;
export const API_AUTH_LOGIN = `${API_AUTH}/login`;
export const API_PROFILES = `${API_HOLIDAZE}/profiles`;
export const API_BOOKINGS = `${API_HOLIDAZE}/bookings`;
export const API_VENUES = `${API_HOLIDAZE}/venues`;
export const API_KEY = "e91a1880-1d99-40a4-a44a-c3d808c11cb0";

// helper function to fetch profile data
export const fetchProfile = async (name, token) => {
  if (!name || !token) {
    throw new Error("Name and token are required to fetch profile.");
  }

  try {
    const response = await fetch(
      `${API_PROFILES}/${name}?_bookings=true&_venues=true`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to fetch profile: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

// update profile
export async function updateProfile(name, token, updates) {
  const response = await fetch(`${API_PROFILES}/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();
  return result.data || result; // Returnerer 'data' hvis til stede, ellers hele resultatet
}

// register new user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_AUTH_REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        venueManager: userData.venueManager || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
};

// login to get token and user data
export const loginUser = async (credentials) => {
  try {
    const loginResponse = await fetch(API_AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${loginResponse.status}`
      );
    }

    const loginResult = await loginResponse.json();
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
    const response = await fetch(API_PROFILES, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
};

// search profiles
export const searchProfiles = async (query) => {
  try {
    const response = await fetch(`${API_PROFILES}/search?q=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
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

  const profile = await fetchProfile(name, token);
  return { success: true, data: profile.venues || [] };
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

  const profile = await fetchProfile(name, token);
  return { success: true, data: profile.bookings || [] };
};

// fetch a specific venue by id
export const fetchVenueById = async (venueId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_VENUES}/${venueId}?_bookings=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching venue:", error);
    throw error;
  }
};

// create booking
export const createBooking = async (bookingData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { success: false, error: "You must be logged in to book a venue." };
  }

  try {
    const response = await fetch(API_BOOKINGS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
};

// fetch booking by id
export const fetchBookingById = async (bookingId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to fetch a booking.",
    };
  }

  try {
    const response = await fetch(`${API_BOOKINGS}/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return { success: false, error: error.message };
  }
};

// update booking
export const updateBooking = async (bookingId, bookingData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to update a booking.",
    };
  }

  try {
    const response = await fetch(`${API_BOOKINGS}/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { success: false, error: error.message };
  }
};

// delete booking
export const deleteBooking = async (bookingId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to delete a booking.",
    };
  }

  try {
    const response = await fetch(`${API_BOOKINGS}/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error.message };
  }
};

// create venue
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
    const response = await fetch(API_VENUES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(venueData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error creating venue:", error);
    return { success: false, error: error.message };
  }
};

// update venue
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
    const response = await fetch(`${API_VENUES}/${venueId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify(venueData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error updating venue:", error);
    return { success: false, error: error.message };
  }
};

// delete venue
export const deleteVenue = async (venueId, token) => {
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
    const response = await fetch(`${API_VENUES}/${venueId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting venue:", error);
    return { success: false, error: error.message };
  }
};

// fetch all venues
export const fetchVenues = async () => {
  try {
    const response = await fetch(API_VENUES, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching venues:", error);
    return [];
  }
};
