import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="p-4 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-3">
        {user && (
          <img
            src={user.avatar?.url || "https://via.placeholder.com/40"}
            alt="Profile"
            className="rounded-circle"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
        )}
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
      </div>
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
          {user ? (
            <>
              {user.venueManager && (
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
              )}
              <li>
                <Link
                  to="/profile"
                  style={{
                    color: "#4A90E2",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={logout}
                  style={{
                    color: "#FF4444",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <>
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
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
