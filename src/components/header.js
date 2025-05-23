import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="p-4 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-3">
        <div
          className="logo-container"
          style={{
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {/* wrapping the img in a Link to make it clickable */}
          <Link to="/">
            <img
              src={`${process.env.PUBLIC_URL}/logo.png`}
              alt="Logo"
              className="responsive-logo"
              style={{
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                console.error("Logo image failed to load:", e);
                e.target.src =
                  "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/7a3ec529632909.55fc107b84b8c.png"; // random img if img for logo fails
              }}
            />
          </Link>
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

      {/* css to make the logo responsive */}
      <style>
        {`
          .logo-container {
            max-width: 100%; /* keeps it from spilling over */
          }
          .responsive-logo {
            height: 100px; /* default size */
            // cool, this is the base size—let’s scale it down on smaller screens
          }
          @media (max-width: 768px) {
            .responsive-logo {
              height: 60px; /* smaller for tablets/phones */
              // tweak this if 60px feels too big or small, maybe try 50px
            }
          }
          @media (max-width: 480px) {
            .responsive-logo {
              height: 40px; /* tiny for phones */
              // adjust this too if it’s not vibing on super small screens
            }
          }
        `}
      </style>
    </header>
  );
}

export default Header;
