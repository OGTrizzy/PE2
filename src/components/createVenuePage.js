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
    media: [{ url: "", alt: "" }], // Starter med ett bildeobjekt
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

  const handleChange = (e, index) => {
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
    } else if (name.startsWith("media.")) {
      const mediaField = name.split(".")[1];
      const newMedia = [...formData.media];
      newMedia[index] = { ...newMedia[index], [mediaField]: value };
      setFormData({
        ...formData,
        media: newMedia,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "number" ? Number(value) : value,
      });
    }
  };

  const addMedia = () => {
    setFormData({
      ...formData,
      media: [...formData.media, { url: "", alt: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user || !user.venueManager) {
      setError("You must be a venue manager to create a venue.");
      return;
    }

    if (formData.price <= 0 || formData.maxGuests <= 0) {
      setError("Price and max guests must be greater than 0.");
      return;
    }

    const cleanedFormData = {
      ...formData,
      media: formData.media.filter(
        (media) => media.url && media.url.trim() !== ""
      ), // Fjern tomme media-objekter
      location: {
        ...formData.location,
        lat: formData.location.lat === 0 ? undefined : formData.location.lat,
        lng: formData.location.lng === 0 ? undefined : formData.location.lng,
      },
    };

    console.log("Sending venue data:", cleanedFormData);

    const result = await createVenue(cleanedFormData);
    if (result.success) {
      setSuccess("Venue created successfully!");
      setTimeout(() => navigate(`/venue/${result.data.id}`), 2000);
    } else {
      setError(result.error || "Failed to create venue. Please try again.");
      console.error("API error details:", result.error);
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
                onChange={(e) => handleChange(e, 0)}
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
                onChange={(e) => handleChange(e, 0)}
                className="form-control"
                required
                style={{ fontFamily: "Open Sans, sans-serif" }}
              />
            </div>
            {formData.media.map((media, index) => (
              <div key={index} className="mb-3">
                <label
                  htmlFor={`media.url-${index}`}
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "600",
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
                  onChange={(e) => handleChange(e, index)}
                  className="form-control mb-2"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                />
                <label
                  htmlFor={`media.alt-${index}`}
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "600",
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
                  onChange={(e) => handleChange(e, index)}
                  className="form-control mb-2"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
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
              Legg til bilde
            </button>
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
                onChange={(e) => handleChange(e, 0)}
                className="form-control"
                required
                min="1"
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
                onChange={(e) => handleChange(e, 0)}
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
                  onChange={(e) => handleChange(e, 0)}
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
                  onChange={(e) => handleChange(e, 0)}
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
                  onChange={(e) => handleChange(e, 0)}
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
                  onChange={(e) => handleChange(e, 0)}
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
                onChange={(e) => handleChange(e, 0)}
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
                onChange={(e) => handleChange(e, 0)}
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
                onChange={(e) => handleChange(e, 0)}
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
