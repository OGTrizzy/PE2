import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchVenueById } from "../api/venues";

function VenuePage() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarDates, setCalendarDates] = useState([]);

  useEffect(() => {
    const getVenue = async () => {
      const data = await fetchVenueById(id);
      setVenue(data);
      if (data && data.bookings) {
        generateCalendar(data.bookings);
      }
      setLoading(false);
    };
    getVenue();
  }, [id]);

  const generateCalendar = (bookings) => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Første dag i inneværende måned
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Siste dag i inneværende måned
    const dates = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toISOString().split("T")[0];
      let isBooked = false;

      if (bookings) {
        for (const booking of bookings) {
          const from = new Date(booking.dateFrom);
          const to = new Date(booking.dateTo);
          if (d >= from && d <= to) {
            isBooked = true;
            break;
          }
        }
      }

      dates.push({ date: new Date(d), dateString, isBooked });
    }

    setCalendarDates(dates);
  };

  if (loading) {
    return (
      <p
        className="text-center"
        style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
      >
        Loading venue...
      </p>
    );
  }

  if (!venue) {
    return (
      <p
        className="text-center"
        style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
      >
        Venue not found.
      </p>
    );
  }

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
      <main className="p-4" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div className="row g-4">
          <div className="col-md-6">
            <img
              src={venue.media?.[0] || "https://via.placeholder.com/800x400"}
              alt={venue.name}
              className="img-fluid rounded"
              style={{ height: "384px", objectFit: "cover" }}
            />
          </div>
          <div className="col-md-6">
            <h2
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
                color: "#333333",
                fontSize: "1.875rem",
                marginBottom: "0.5rem",
              }}
            >
              {venue.name}
            </h2>
            <p
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                fontSize: "1.125rem",
                marginBottom: "1rem",
              }}
            >
              ${venue.price}/night
            </p>
            <p
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            >
              {venue.description || "No description available."}
            </p>
            <div className="card p-4 shadow-sm mb-4">
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#333333",
                  fontSize: "1.125rem",
                  marginBottom: "1rem",
                }}
              >
                Availability Calendar
              </h3>
              <div className="row row-cols-3 row-cols-md-5 g-2">
                {calendarDates.map((dateObj) => (
                  <div key={dateObj.dateString} className="col text-center">
                    <div
                      className={`p-2 rounded ${
                        dateObj.isBooked
                          ? "bg-danger text-white"
                          : "bg-success text-white"
                      }`}
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        fontSize: "0.875rem",
                      }}
                    >
                      {dateObj.date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn w-100"
              style={{
                backgroundColor: "#FF6F61",
                color: "white",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VenuePage;
