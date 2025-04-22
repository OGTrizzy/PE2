import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createVenue } from "../api/auth";

function CreateVenuePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    media: [""],
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
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("meta.")) {
      const metaField = name.split(".")[1];
      setFormData({
        ...formData,
        meta: {
          ...formData.meta,
          [metaField]: type === "checkbox" ? checked : value,
        },
      });
    } else if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else if (name === "media") {
      setFormData({
        ...formData,
        media: [value],
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "number" ? Number(value) : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const venueData = {
      name: formData.name,
      description: formData.description,
      media: formData.media.filter((url) => url.trim() !== ""),
      price: formData.price,
      maxGuests: formData.maxGuests,
      rating: formData.rating,
      meta: formData.meta,
      location: formData.location,
    };

    const result = await createVenue(venueData);
    if (result.success) {
      setMessage("Venue created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setError(result.error || "Failed to create venue. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <header className="p-4 d-flex justify-content-between align-items-center">
        <h1
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            color: "#FF6F61",
            fontSize: "1.5rem",
          }}
        >
          Holidaze
        </h1>
        <nav>
          <ul className="d-flex list-unstyled gap-3 m-0">
            <li>
              <Link
                to="/"
                style={{
                  color: "#4A90E2",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/venues"
                style={{
                  color: "#4A90E2",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Venues
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                style={{
                  color: "#4A90E2",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                style={{
                  color: "#4A90E2",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Register
              </Link>
            </li>
            <li>
              <Link
                to="/create-venue"
                style={{
                  color: "#4A90E2",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Create Venue
              </Link>
            </li>
          </ul>
        </nav>
      </header>
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
          Create a New Venue
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
              onChange={handleChange}
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
              onChange={handleChange}
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
          <div className="mb-3">
            <label
              htmlFor="media"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Media URL
            </label>
            <input
              type="url"
              id="media"
              name="media"
              value={formData.media[0]}
              onChange={handleChange}
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
              onChange={handleChange}
              className="form-control"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
              min="0"
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
            Create Venue
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateVenuePage;
