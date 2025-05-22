import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.js";
import { AuthContext } from "../context/authContext.js";
import Header from "../components/header.js";

// helper to update form fields
const handleFormChange = (setFormData) => (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // handle form submission with login logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setUserData(null);

    const result = await loginUser(formData);
    if (result.success) {
      login(result.data, result.data.accessToken);
      setUserData(result.data);
      setMessage("Login successful!");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } else {
      // check for 401 error to show a message
      if (result.error && result.error.includes("401")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(result.error || "Failed to log in. Please try again.");
      }
    }
  };

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
          Login
        </h2>
        {/* show success or error messages */}
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
        {userData ? (
          <div className="card p-4 shadow-sm">
            <h3
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "600",
                color: "#333333",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              Welcome, {userData.name}!
            </h3>
            <p
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            >
              {userData.bio || "No bio available."}
            </p>
            {userData.avatar?.url && (
              <img
                src={userData.avatar.url}
                alt={userData.avatar.alt || "User avatar"}
                className="rounded-circle mb-3"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            )}
            <p
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                fontSize: "1rem",
              }}
            >
              You are {userData.venueManager ? "a venue manager" : "a customer"}
              .
            </p>
            <p
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                fontSize: "1rem",
              }}
            >
              You have {userData.venues?.length || 0} venue(s) and{" "}
              {userData.bookings?.length || 0} booking(s).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="email"
                className="form-label"
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange(setFormData)}
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
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange(setFormData)}
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
              Login
            </button>
          </form>
        )}
        <p
          className="mt-3 text-center"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "#4A90E2", textDecoration: "none" }}
          >
            Register here
          </Link>
        </p>
      </main>
    </div>
  );
}

export default LoginPage;
