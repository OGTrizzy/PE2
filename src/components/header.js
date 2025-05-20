import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="p-4 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-3">
        <div
          style={{
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <img
            src="logo.png"
            alt="Logo"
            style={{
              height: "100px",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              console.error("Logo image failed to load:", e);
              e.target.src = "https://via.placeholder.com/150x40";
            }}
          />
        </div>
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
