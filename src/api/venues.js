import { API_VENUES } from "./auth";

export const fetchVenueById = async (id) => {
  try {
    const response = await fetch(`${API_VENUES}/${id}`, {
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
    console.error("Error fetching venue:", error);
    return null;
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
