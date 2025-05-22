import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import {
  fetchProfile,
  updateProfile,
  deleteVenue,
  fetchVenueById,
  fetchBookingById,
} from "../api/auth";
import Header from "../components/header.js";

// helper function to calculate total price for a booking
const calculateTotalPrice = (booking, venuePrice) => {
  const dateFrom = new Date(booking.dateFrom);
  const dateTo = new Date(booking.dateTo);
  const nights = Math.ceil((dateTo - dateFrom) / (1000 * 60 * 60 * 24));
  return nights * venuePrice;
};

function ProfilePage() {
  const { user: contextUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [isVenueManager, setIsVenueManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    avatar: { url: "" },
    bio: "",
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  // load user from localstorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLocalUser(parsedUser);
        setIsVenueManager(parsedUser?.venueManager || false);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        setError("Invalid user data in localStorage.");
        setLoading(false);
      }
    } else {
      setError("You need to be logged in to view this page.");
      setLoading(false);
    }
  }, []);

  // load profile data and bookings
  useEffect(() => {
    const loadProfileAndBookings = async () => {
      if (!localUser) return;

      setLoading(true);
      try {
        const token = localUser.accessToken;
        const name = localUser.name;

        if (!token || !name) {
          setError("No authentication token or username available.");
          setLoading(false);
          return;
        }

        // fetch user profile data
        const data = await fetchProfile(name, token);
        setProfileData(
          data || { bookings: [], venues: [], avatar: {}, bio: "" }
        );
        setEditFormData({
          avatar: { url: data.avatar?.url || "" },
          bio: data.bio || "",
        });
        setIsVenueManager(
          data.venueManager || localUser?.venueManager || false
        );

        // fetch bookings for venue managers only
        if (isVenueManager) {
          const venueBookings = await Promise.all(
            (data.venues || []).map(async (venue) => {
              try {
                const venueData = await fetchVenueById(venue.id);

                const bookings = await Promise.all(
                  (venueData.bookings || []).map(async (booking) => {
                    try {
                      const bookingDetails = await fetchBookingById(booking.id);
                      if (bookingDetails.success) {
                        return {
                          ...bookingDetails.data,
                          venueName: venue.name,
                          venuePrice: venue.price,
                        };
                      }
                      return null;
                    } catch (err) {
                      console.error(
                        `Error fetching booking ${booking.id}:`,
                        err
                      );
                      return null;
                    }
                  })
                );

                return bookings.filter((booking) => booking !== null);
              } catch (err) {
                console.error(
                  `Error fetching bookings for venue ${venue.id}:`,
                  err
                );
                return [];
              }
            })
          );

          const allBookings = venueBookings.flat();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const filteredBookings = allBookings.filter(
            (booking) =>
              new Date(booking.dateFrom).setHours(0, 0, 0, 0) >= today
          );
          setUpcomingBookings(filteredBookings);
        }
      } catch (err) {
        setError(`Failed to fetch profile: ${err.message}`);
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (localUser) {
      loadProfileAndBookings();
    }
  }, [localUser, isVenueManager]);

  // handle form input changes for editing profile
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "avatar") {
      setEditFormData((prev) => ({
        ...prev,
        avatar: { url: value },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // handle profile update submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localUser?.accessToken || contextUser?.accessToken;
      const name = localUser?.name;
      if (!token || !name) {
        setError("No authentication token or username available.");
        return;
      }

      const updatedData = await updateProfile(name, token, editFormData);
      setProfileData(
        updatedData || {
          ...profileData,
          ...editFormData,
          bookings: profileData?.bookings || [],
          venues: profileData?.venues || [],
        }
      );
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError(`Error updating profile: ${err.message}`);
      console.error("Update profile error:", err);
    }
  };

  // handle venue deletion
  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) {
      return;
    }

    try {
      const token = localUser?.accessToken || contextUser?.accessToken;
      if (!token) {
        setError("No authentication token available.");
        return;
      }

      const result = await deleteVenue(venueId);
      if (result.success) {
        setProfileData((prevData) => ({
          ...prevData,
          venues: prevData.venues.filter((venue) => venue.id !== venueId),
        }));
        alert("Venue deleted successfully!");
      } else {
        setError("Failed to delete venue.");
      }
    } catch (err) {
      setError("Error deleting venue. Please try again.");
      console.error("Delete venue error:", err);
    }
  };

  // loading state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Header />
        <p
          className="text-center"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          Loading profile...
        </p>
      </div>
    );
  }

  // error state
  if (error || !profileData) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Header />
        <p
          className="text-center alert alert-danger"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          {error || "Profile data not available."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header />
      <main className="p-4" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* profile section */}
        <div className="card shadow-sm p-4 mb-4">
          <div className="row">
            <div className="col-md-3 text-center">
              {isEditing ? (
                <div className="mb-3">
                  <label
                    htmlFor="avatar"
                    style={{
                      fontFamily: "Open Sans, sans-serif",
                      color: "#333333",
                    }}
                  >
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    id="avatar"
                    name="avatar"
                    value={editFormData.avatar.url}
                    onChange={handleEditChange}
                    className="form-control"
                    style={{
                      fontFamily: "Open Sans, sans-serif",
                      color: "#333333",
                      backgroundColor: "#F5F5F5",
                      borderColor: "#333333",
                    }}
                  />
                </div>
              ) : (
                <img
                  src={
                    profileData.avatar?.url ||
                    localUser?.avatar?.url ||
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb"
                  }
                  alt={profileData.name || localUser?.name || "User"}
                  className="rounded-circle"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                  }}
                  onError={(e) =>
                    (e.target.src =
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb")
                  }
                />
              )}
            </div>
            <div className="col-md-9">
              <h2
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                  color: "#333333",
                  fontSize: "1.875rem",
                }}
              >
                {profileData.name || localUser?.name}
              </h2>
              <p
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                  fontSize: "1rem",
                }}
              >
                <strong>Email:</strong> {profileData.email || localUser?.email}
              </p>
              <p
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                  fontSize: "1rem",
                }}
              >
                <strong>Role:</strong>{" "}
                {isVenueManager ? "Venue Manager" : "Customer"}
              </p>
              {isEditing ? (
                <div className="mb-3">
                  <label
                    htmlFor="bio"
                    style={{
                      fontFamily: "Open Sans, sans-serif",
                      color: "#333333",
                    }}
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleEditChange}
                    className="form-control"
                    style={{
                      fontFamily: "Open Sans, sans-serif",
                      color: "#333333",
                      backgroundColor: "#F5F5F5",
                      borderColor: "#333333",
                    }}
                  />
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    color: "#333333",
                    fontSize: "1rem",
                  }}
                >
                  <strong>Bio:</strong> {profileData.bio || "No bio available."}
                </p>
              )}
              {isEditing ? (
                <div className="d-flex gap-2">
                  <button
                    onClick={handleEditSubmit}
                    className="btn"
                    style={{
                      backgroundColor: "#4A90E2",
                      color: "white",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "bold",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditFormData({
                        avatar: { url: profileData.avatar?.url || "" },
                        bio: profileData.bio || "",
                      });
                    }}
                    className="btn"
                    style={{
                      backgroundColor: "#FF6F61",
                      color: "white",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "bold",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn"
                  style={{
                    backgroundColor: "#4A90E2",
                    color: "white",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "bold",
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex gap-4 flex-wrap">
          {/* my bookings section */}
          <div
            className="flex-grow-1"
            style={{ minWidth: "300px", maxWidth: "33%" }}
          >
            <h3
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "600",
                color: "#333333",
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              My Bookings
            </h3>
            {profileData.bookings?.length === 0 ? (
              <p
                style={{
                  fontFamily: "Open Sans, sans-serif",
                  color: "#333333",
                  fontSize: "1rem",
                }}
              >
                You have no bookings yet.
              </p>
            ) : (
              <div className="row row-cols-1 g-4">
                {profileData.bookings?.map((booking) => (
                  <div key={booking.id} className="col">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <h4
                          className="card-title"
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "bold",
                            color: "#333333",
                            fontSize: "1.125rem",
                          }}
                        >
                          {booking.venue?.name || "Unknown Venue"}
                        </h4>
                        <p
                          style={{
                            fontFamily: "Open Sans, sans-serif",
                            color: "#333333",
                            fontSize: "0.875rem",
                          }}
                        >
                          <strong>From:</strong>{" "}
                          {new Date(booking.dateFrom).toLocaleDateString()}
                        </p>
                        <p
                          style={{
                            fontFamily: "Open Sans, sans-serif",
                            color: "#333333",
                            fontSize: "0.875rem",
                          }}
                        >
                          <strong>To:</strong>{" "}
                          {new Date(booking.dateTo).toLocaleDateString()}
                        </p>
                        <p
                          style={{
                            fontFamily: "Open Sans, sans-serif",
                            color: "#333333",
                            fontSize: "0.875rem",
                          }}
                        >
                          <strong>Guests:</strong> {booking.guests}
                        </p>
                        <Link
                          to={`/venue/${booking.venue?.id}`}
                          className="btn w-100"
                          style={{
                            backgroundColor: "#FF6F61",
                            color: "white",
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: "bold",
                          }}
                        >
                          View Venue
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* my venues section for managers */}
          {isVenueManager && (
            <div
              className="flex-grow-1"
              style={{ minWidth: "300px", maxWidth: "33%" }}
            >
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                My Venues
              </h3>
              {profileData.venues?.length === 0 ? (
                <p
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    color: "#333333",
                    fontSize: "1rem",
                  }}
                >
                  You have no venues yet.{" "}
                  <Link
                    to="/create-venue"
                    style={{
                      color: "#FF6F61",
                      fontFamily: "Open Sans, sans-serif",
                      textDecoration: "underline",
                    }}
                  >
                    Create one now!
                  </Link>
                </p>
              ) : (
                <div className="row row-cols-1 g-4">
                  {profileData.venues?.map((venue) => (
                    <div key={venue.id} className="col">
                      <div className="card h-100 shadow-sm">
                        <img
                          src={
                            venue.media && venue.media[0]
                              ? typeof venue.media[0] === "string"
                                ? venue.media[0]
                                : venue.media[0]?.url ||
                                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb"
                              : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb"
                          }
                          alt={venue.name}
                          className="card-img-top"
                          style={{ height: "160px", objectFit: "cover" }}
                          onError={(e) =>
                            (e.target.src =
                              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb")
                          }
                        />
                        <div className="card-body">
                          <h4
                            className="card-title"
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: "bold",
                              color: "#333333",
                              fontSize: "1.125rem",
                            }}
                          >
                            {venue.name}
                          </h4>
                          <p
                            style={{
                              fontFamily: "Open Sans, sans-serif",
                              color: "#333333",
                              fontSize: "0.875rem",
                            }}
                          >
                            ${venue.price}/night
                          </p>
                          <Link
                            to={`/venue/${venue.id}`}
                            className="btn w-100 mb-2"
                            style={{
                              backgroundColor: "#FF6F61",
                              color: "white",
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: "bold",
                            }}
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/venue/${venue.id}/edit`}
                            className="btn w-100 mb-2"
                            style={{
                              backgroundColor: "#4A90E2",
                              color: "white",
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: "bold",
                            }}
                          >
                            Edit Venue
                          </Link>
                          <button
                            onClick={() => handleDeleteVenue(venue.id)}
                            className="btn w-100"
                            style={{
                              backgroundColor: "#FF6F61",
                              color: "white",
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: "bold",
                            }}
                          >
                            Delete Venue
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* upcoming bookings for managers */}
          {isVenueManager && (
            <div
              className="flex-grow-1"
              style={{ minWidth: "300px", maxWidth: "33%" }}
            >
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                Upcoming Bookings for My Venues
              </h3>
              {upcomingBookings.length === 0 ? (
                <p
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    color: "#333333",
                    fontSize: "1rem",
                  }}
                >
                  No upcoming bookings for your venues.
                </p>
              ) : (
                <div className="row row-cols-1 g-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="col">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h4
                            className="card-title"
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              fontWeight: "bold",
                              color: "#333333",
                              fontSize: "1.125rem",
                            }}
                          >
                            {booking.venueName}
                          </h4>
                          <p
                            style={{
                              fontFamily: "Open Sans, sans-serif",
                              color: "#333333",
                              fontSize: "0.875rem",
                            }}
                          >
                            <strong>Date:</strong>{" "}
                            {new Date(booking.dateFrom).toLocaleDateString()} to{" "}
                            {new Date(booking.dateTo).toLocaleDateString()}
                          </p>
                          <p
                            style={{
                              fontFamily: "Open Sans, sans-serif",
                              color: "#333333",
                              fontSize: "0.875rem",
                            }}
                          >
                            <strong>Guests:</strong> {booking.guests}
                          </p>
                          <p
                            style={{
                              fontFamily: "Open Sans, sans-serif",
                              color: "#333333",
                              fontSize: "0.875rem",
                              fontWeight: "bold",
                            }}
                          >
                            <strong>Total:</strong> $
                            {calculateTotalPrice(booking, booking.venuePrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
