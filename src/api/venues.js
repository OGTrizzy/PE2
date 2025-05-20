import { API_VENUES, API_KEY } from "./auth";

export const fetchVenueById = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage.");
    return { success: false, error: "No authentication token available." };
  }

  try {
    const response = await fetch(`${API_VENUES}/${id}`, {
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

    if (!result.data) {
      throw new Error("No venue data found in response.");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error fetching venue:", error);
    return { success: false, error: error.message };
  }
};

export const searchVenues = async (query) => {
  try {
    const url = query ? `${API_VENUES}/search?q=${query}` : API_VENUES;
    const response = await fetch(url, {
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
    console.error("Error searching venues:", error);
    return [];
  }
};
