import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createVenue } from "../api/auth";
import { AuthContext } from "../context/authContext";
import Header from "../components/header";

function CreateVenuePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    media: [],
    price: 0,
    maxGuests: 1,
    rating: 0,
    meta: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false,
    },
    location: {
      address: "",
      city: "",
      zip: "",
      country: "",
      continent: "",
      lat: 0,
      lng: 0,
    },
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("meta.")) {
      const metaField = name.split(".")[1];
      setFormData({
        ...formData,
        meta: { ...formData.meta, [metaField]: checked },
      });
    } else if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [locationField]: value },
      });
    } else if (name === "media") {
      setFormData({ ...formData, media: [value] });
    } else {
      setFormData({
        ...formData,
        [name]: type === "number" ? Number(value) : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user || !user.venueManager) {
      setError("You must be a venue manager to create a venue.");
      return;
    }

    const result = await createVenue(formData);
    if (result.success) {
      setSuccess("Venue created successfully!");
      setTimeout(() => navigate(`/venue/${result.data.id}`), 2000);
    } else {
      setError(result.error || "Failed to create venue. Please try again.");
    }
  };

  if (!user || !user.venueManager) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Header />
        <p
          className="text-center"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          You must be a venue manager to create a venue.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header />
      <main className="p-4" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            color: "#333333",
            fontSize: "1.875rem",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          Create New Venue
        </h2>
        <div className="card p-4 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="name"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Venue Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="description"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                required
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="media"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Media URL (optional)
              </label>
              <input
                type="url"
                id="media"
                name="media"
                value={formData.media[0] || ""}
                onChange={handleChange}
                className="form-control"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="price"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Price per Night
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                required
                min="0"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="maxGuests"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Max Guests
              </label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleChange}
                className="form-control"
                required
                min="1"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            <div className="mb-3">
              <label
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Amenities
              </label>
              <div className="form-check">
                <input
                  type="checkbox"
                  id="wifi"
                  name="meta.wifi"
                  checked={formData.meta.wifi}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                htmlFor="location.address"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Address (optional)
              </label>
              <input
                type="text"
                id="location.address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="form-control"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="location.city"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                City (optional)
              </label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className="form-control"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="location.country"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                }}
              >
                Country (optional)
              </label>
              <input
                type="text"
                id="location.country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                className="form-control"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            {error && (
              <div
                className="alert alert-danger"
                role="alert"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="alert alert-success"
                role="alert"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {success}
              </div>
            )}
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
              Create Venue
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateVenuePage;
