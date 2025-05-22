import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { fetchVenueById } from "../api/venues";
import { updateVenue } from "../api/auth";
import Header from "../components/header";

// helper to handle form changes
const handleFormChange = (setFormData) => (e, index) => {
  const { name, value, type, checked } = e.target;
  if (name.startsWith("meta.")) {
    const metaField = name.split(".")[1];
    setFormData((prev) => ({
      ...prev,
      meta: { ...prev.meta, [metaField]: checked },
    }));
  } else if (name.startsWith("location.")) {
    const locationField = name.split(".")[1];
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [locationField]: value },
    }));
  } else if (name.startsWith("media.")) {
    const mediaField = name.split(".")[1];
    setFormData((prev) => {
      const newMedia = [...prev.media];
      newMedia[index] = { ...newMedia[index], [mediaField]: value };
      return { ...prev, media: newMedia };
    });
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }
};

function EditVenuePage() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch venue data when page loads
    const getVenue = async () => {
      if (!user) {
        setError("You must be logged in to edit a venue.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const venue = await fetchVenueById(id, token);
        if (venue.success && venue.data) {
          setFormData({
            name: venue.data.name || "",
            description: venue.data.description || "",
            media: Array.isArray(venue.data.media)
              ? venue.data.media
              : [{ url: "", alt: "" }],
            price: venue.data.price || 0,
            maxGuests: venue.data.maxGuests || 1,
            rating: venue.data.rating || 0,
            meta: {
              wifi: venue.data.meta?.wifi || false,
              parking: venue.data.meta?.parking || false,
              breakfast: venue.data.meta?.breakfast || false,
              pets: venue.data.meta?.pets || false,
            },
            location: {
              address: venue.data.location?.address || "",
              city: venue.data.location?.city || "",
              zip: venue.data.location?.zip || "",
              country: venue.data.location?.country || "",
              continent: venue.data.location?.continent || "",
              lat: venue.data.location?.lat || 0,
              lng: venue.data.location?.lng || 0,
            },
          });
        } else {
          setError(venue.error || "Venue not found.");
        }
      } catch (err) {
        setError(`Error fetching venue: ${err.message}`);
        console.error("Fetch venue error:", err);
      } finally {
        setLoading(false);
      }
    };
    getVenue();
  }, [id, user]);

  // add another media slot
  const addMedia = () =>
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, { url: "", alt: "" }],
    }));

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!user || !user.venueManager) {
      setError("You must be a venue manager to edit a venue.");
      return;
    }

    if (formData.price <= 0 || formData.maxGuests <= 0) {
      setError("Price and max guests must be greater than 0.");
      return;
    }

    const filteredMedia = formData.media.filter(
      (media) => media.url && media.url.trim() !== ""
    );
    const venueData = {
      name: formData.name,
      description: formData.description,
      ...(filteredMedia.length > 0 && { media: filteredMedia }), // exclude if empty
      price: formData.price,
      maxGuests: formData.maxGuests,
      rating: formData.rating !== undefined ? formData.rating : 0,
      meta: formData.meta,
      location: {
        ...formData.location,
        lat: formData.location.lat === 0 ? undefined : formData.location.lat,
        lng: formData.location.lng === 0 ? undefined : formData.location.lng,
      },
    };

    try {
      const result = await updateVenue(id, venueData);
      if (result.success) {
        setMessage("Venue updated successfully!");
        setTimeout(() => navigate(`/venue/${id}`), 2000);
      } else {
        setError(result.error || "Failed to update venue. Please try again.");
      }
    } catch (err) {
      setError(`Error updating venue: ${err.message}`);
      console.error("Update venue error:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Header />
        <p
          className="text-center"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          Loading venue...
        </p>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Header />
        <p
          className="text-center alert alert-danger"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          {error || "Venue data not available."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header />
      <main className="p-4" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            color: "#333333",
            fontSize: "1.875rem",
            marginBottom: "1rem",
          }}
        >
          Edit Venue
        </h2>
        {message && (
          <div
            className="alert alert-success"
            role="alert"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            {message}
          </div>
        )}
        {error && (
          <div
            className="alert alert-danger"
            role="alert"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="name"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Venue Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
              required
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="description"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
              rows="4"
              required
            />
          </div>
          {formData.media.map((media, index) => (
            <div key={index} className="mb-3">
              <label
                htmlFor={`media.url-${index}`}
                className="form-label"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                Media URL {index + 1}
              </label>
              <input
                type="url"
                id={`media.url-${index}`}
                name="media.url"
                value={media.url}
                onChange={(e) => handleFormChange(setFormData)(e, index)}
                className="form-control mb-2"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                  backgroundColor: "#F5F5F5",
                  borderColor: "#333333",
                }}
              />
              <label
                htmlFor={`media.alt-${index}`}
                className="form-label"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                Media Alt Text {index + 1}
              </label>
              <input
                type="text"
                id={`media.alt-${index}`}
                name="media.alt"
                value={media.alt}
                onChange={(e) => handleFormChange(setFormData)(e, index)}
                className="form-control mb-2"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                  backgroundColor: "#F5F5F5",
                  borderColor: "#333333",
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addMedia}
            className="btn btn-secondary mb-3"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: "bold",
              backgroundColor: "#4A90E2",
              color: "white",
            }}
          >
            Add Another Image
          </button>
          <div className="mb-3">
            <label
              htmlFor="price"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Price per Night
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
              min="1"
              required
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="maxGuests"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Max Guests
            </label>
            <input
              type="number"
              id="maxGuests"
              name="maxGuests"
              value={formData.maxGuests}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
              min="1"
              required
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="rating"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Rating (0-5)
            </label>
            <input
              type="number"
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
              min="0"
              max="5"
            />
          </div>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Amenities
            </label>
            <div className="form-check">
              <input
                type="checkbox"
                id="wifi"
                name="meta.wifi"
                checked={formData.meta.wifi}
                onChange={(e) => handleFormChange(setFormData)(e, 0)}
                className="form-check-input"
              />
              <label
                htmlFor="wifi"
                className="form-check-label"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                WiFi
              </label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                id="parking"
                name="meta.parking"
                checked={formData.meta.parking}
                onChange={(e) => handleFormChange(setFormData)(e, 0)}
                className="form-check-input"
              />
              <label
                htmlFor="parking"
                className="form-check-label"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                Parking
              </label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                id="breakfast"
                name="meta.breakfast"
                checked={formData.meta.breakfast}
                onChange={(e) => handleFormChange(setFormData)(e, 0)}
                className="form-check-input"
              />
              <label
                htmlFor="breakfast"
                className="form-check-label"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                Breakfast
              </label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                id="pets"
                name="meta.pets"
                checked={formData.meta.pets}
                onChange={(e) => handleFormChange(setFormData)(e, 0)}
                className="form-check-input"
              />
              <label
                htmlFor="pets"
                className="form-check-label"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                Pets Allowed
              </label>
            </div>
          </div>
          <div className="mb-3">
            <label
              htmlFor="address"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="location.address"
              value={formData.location.address}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="city"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="location.city"
              value={formData.location.city}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="zip"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              name="location.zip"
              value={formData.location.zip}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="country"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="location.country"
              value={formData.location.country}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="continent"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Continent
            </label>
            <input
              type="text"
              id="continent"
              name="location.continent"
              value={formData.location.continent}
              onChange={(e) => handleFormChange(setFormData)(e, 0)}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: "#FF6F61",
              color: "white",
              fontFamily: "Poppins, sans-serif",
              fontWeight: "bold",
            }}
          >
            Update Venue
          </button>
          <Link
            to={`/venue/${id}`}
            className="btn w-100 mt-2"
            style={{
              backgroundColor: "#4A90E2",
              color: "white",
              fontFamily: "Poppins, sans-serif",
              fontWeight: "bold",
            }}
          >
            Cancel
          </Link>
        </form>
      </main>
    </div>
  );
}

export default EditVenuePage;
