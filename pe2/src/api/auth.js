export const API_BASE = "https://v2.api.noroff.dev";
export const API_HOLIDAZE = `${API_BASE}/holidaze`;
export const API_AUTH = `${API_BASE}/auth`;
export const API_AUTH_REGISTER = `${API_AUTH}/register`;
export const API_AUTH_LOGIN = `${API_AUTH}/login`;
export const API_AUTH_KEY = `${API_AUTH}/create-api-key`;
export const API_BOOKINGS = `${API_HOLIDAZE}/bookings`;
export const API_VENUES = `${API_HOLIDAZE}/venues`;

export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_AUTH_REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(API_AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error logging in user:", error);
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
    return { success: true, data };
  } catch (error) {
    console.error("Error creating booking:", error);
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
    return { success: true, data };
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
    return { success: true, data };
  } catch (error) {
    console.error("Error updating venue:", error);
    return { success: false, error: error.message };
  }
};
