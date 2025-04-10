import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/auth";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    venueManager: false,
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      venueManager: formData.venueManager,
    };

    const result = await registerUser(userData);
    if (result.success) {
      setMessage("Registration successful! You can now log in.");
    } else {
      setError(result.error || "Failed to register. Please try again.");
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
          </ul>
        </nav>
      </header>
      <main className="p-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            color: "#333333",
            fontSize: "1.875rem",
            marginBottom: "1rem",
          }}
        >
          Register
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
              Name
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
              htmlFor="email"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
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
              htmlFor="password"
              className="form-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
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
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              id="venueManager"
              name="venueManager"
              checked={formData.venueManager}
              onChange={handleChange}
              className="form-check-input"
            />
            <label
              htmlFor="venueManager"
              className="form-check-label"
              style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
            >
              Register as Venue Manager
            </label>
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
            Register
          </button>
        </form>
      </main>
    </div>
  );
}

export default RegisterPage;
