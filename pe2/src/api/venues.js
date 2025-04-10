import { API_HOLIDAZE } from "./auth";

export const fetchVenues = async () => {
  try {
    const response = await fetch(`${API_HOLIDAZE}/venues`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching venues:", error);
    return [];
  }
};

export const searchVenues = async (query) => {
  const venues = await fetchVenues();
  if (!query) return venues;
  return venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(query.toLowerCase()) ||
      (venue.location?.city &&
        venue.location.city.toLowerCase().includes(query.toLowerCase()))
  );
};

export const fetchVenueById = async (id) => {
  try {
    const response = await fetch(`${API_HOLIDAZE}/venues/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching venue with id ${id}:`, error);
    return null;
  }
};
