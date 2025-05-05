export const API_BASE = "https://v2.api.noroff.dev";
export const API_HOLIDAZE = `${API_BASE}/holidaze`;
export const API_AUTH = `${API_BASE}/auth`;
export const API_AUTH_REGISTER = `${API_AUTH}/register`;
export const API_AUTH_LOGIN = `${API_AUTH}/login`;
export const API_AUTH_KEY = `${API_AUTH}/create-api-key`;
export const API_PROFILES = `${API_HOLIDAZE}/profiles`;
export const API_BOOKINGS = `${API_HOLIDAZE}/bookings`;
export const API_VENUES = `${API_HOLIDAZE}/venues`;
export const API_KEY = "e91a1880-1d99-40a4-a44a-c3d808c11cb0";

// helpfunction to get profiledata
const fetchProfile = async (name, token) => {
  try {
    const response = await fetch(`${API_PROFILES}/${name}`, {
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

// login to get token
export const loginUser = async (credentials) => {
  try {
    const loginResponse = await fetch(API_AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

    localStorage.setItem("token", token); // save token
    localStorage.setItem("name", userName); // save name

    // get profiledata with token
    const profileData = await fetchProfile(userName, token);

    return {
      success: true,
      data: {
        accessToken: token,
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio || "",
        avatar: profileData.avatar || { url: "", alt: "" },
        banner: profileData.banner || { url: "", alt: "" },
        venueManager: profileData.venueManager || false,
        venues: profileData.venues || [],
        bookings: profileData.bookings || [],
      },
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, error: error.message };
  }
};

export const createApiKey = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to create an API key.",
    };
  }

  try {
    const response = await fetch(API_AUTH_KEY, {
      method: "POST",
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

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error creating API key:", error);
    return { success: false, error: error.message };
  }
};

//get profiles
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

export const fetchProfileVenues = async (name) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to fetch profile venues.",
    };
  }

  try {
    const response = await fetch(`${API_PROFILES}/${name}/venues`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.error("Error fetching profile venues:", error);
    return { success: false, error: error.message };
  }
};

export const fetchProfileBookings = async (name) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      success: false,
      error: "You must be logged in to fetch profile bookings.",
    };
  }

  try {
    const response = await fetch(`${API_PROFILES}/${name}/bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.error("Error fetching profile bookings:", error);
    return { success: false, error: error.message };
  }
};

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
    const response = await fetch(`${API_VENUES}/${venueId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
