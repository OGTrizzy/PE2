import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchVenueById } from "../api/venues";
import { createBooking, deleteVenue } from "../api/auth";
import { AuthContext } from "../context/authContext";
import Header from "../components/header";

function VenuePage() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarDates, setCalendarDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState({
    dateFrom: null,
    dateTo: null,
  });
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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

  const handleDateClick = (dateString, isBooked) => {
    if (isBooked) {
      setBookingError("This date is already booked.");
      return;
    }

    if (!selectedDates.dateFrom) {
      setSelectedDates({ dateFrom: dateString, dateTo: null });
      setBookingError(null);
    } else if (!selectedDates.dateTo) {
      const fromDate = new Date(selectedDates.dateFrom);
      const toDate = new Date(dateString);
      if (toDate < fromDate) {
        setBookingError("End date cannot be before start date.");
        return;
      }

      const datesInRange = calendarDates.filter((d) => {
        const currentDate = new Date(d.dateString);
        return currentDate >= fromDate && currentDate <= toDate;
      });
      const hasBookedDate = datesInRange.some((d) => d.isBooked);
      if (hasBookedDate) {
        setBookingError("Some dates in the selected range are already booked.");
        setSelectedDates({ dateFrom: null, dateTo: null });
        return;
      }

      setSelectedDates({ ...selectedDates, dateTo: dateString });
      setBookingError(null);
    } else {
      setSelectedDates({ dateFrom: dateString, dateTo: null });
      setBookingError(null);
    }
  };

  const handleBooking = async () => {
    if (!selectedDates.dateFrom || !selectedDates.dateTo) {
      setBookingError("Please select both a start and end date.");
      return;
    }

    const bookingData = {
      dateFrom: selectedDates.dateFrom,
      dateTo: selectedDates.dateTo,
      guests: 1,
      venueId: id,
    };

    const result = await createBooking(bookingData);
    if (result.success) {
      setBookingMessage("Booking successful!");
      setSelectedDates({ dateFrom: null, dateTo: null });
      const updatedVenue = await fetchVenueById(id);
      setVenue(updatedVenue);
      if (updatedVenue && updatedVenue.bookings) {
        generateCalendar(updatedVenue.bookings);
      }
    } else {
      setBookingError(
        result.error || "Failed to create booking. Please try again."
      );
    }
  };

  const handleDelete = async () => {
    if (
      !user ||
      !user.venueManager ||
      !venue ||
      venue.owner?.name !== user.name
    ) {
      setDeleteError("You are not authorized to delete this venue.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this venue?")) {
      return;
    }

    const result = await deleteVenue(id);
    if (result.success) {
      setDeleteMessage("Venue deleted successfully!");
      setTimeout(() => navigate("/venues"), 2000);
    } else {
      setDeleteError(result.error || "Failed to delete venue.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Header />
        <p
          className="text-center"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          Loading venue...
        </p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
        <Header />
        <p
          className="text-center"
          style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
        >
          Venue not found.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header />
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
                      onClick={() =>
                        handleDateClick(dateObj.dateString, dateObj.isBooked)
                      }
                      className={`p-2 rounded ${
                        dateObj.isBooked
                          ? "bg-danger text-white"
                          : selectedDates.dateFrom === dateObj.dateString ||
                            selectedDates.dateTo === dateObj.dateString
                          ? "bg-primary text-white"
                          : "bg-success text-white"
                      }`}
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      {dateObj.date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              {selectedDates.dateFrom && (
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    color: "#333333",
                  }}
                >
                  Start Date: {selectedDates.dateFrom}
                </p>
              )}
              {selectedDates.dateTo && (
                <p
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    color: "#333333",
                  }}
                >
                  End Date: {selectedDates.dateTo}
                </p>
              )}
            </div>
            {bookingMessage && (
              <div
                className="alert alert-success"
                role="alert"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {bookingMessage}
              </div>
            )}
            {bookingError && (
              <div
                className="alert alert-danger"
                role="alert"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {bookingError}
              </div>
            )}
            <button
              onClick={handleBooking}
              className="btn w-100 mb-2"
              style={{
                backgroundColor: "#FF6F61",
                color: "white",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
              }}
            >
              Book Now
            </button>
            {user &&
              user.venueManager &&
              venue &&
              venue.owner?.name === user.name && (
                <>
                  <Link
                    to={`/venue/${id}/edit`}
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
                    onClick={handleDelete}
                    className="btn w-100"
                    style={{
                      backgroundColor: "#FF4444",
                      color: "white",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "bold",
                    }}
                  >
                    Delete Venue
                  </button>
                </>
              )}
            {deleteMessage && (
              <div
                className="alert alert-success mt-2"
                role="alert"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {deleteMessage}
              </div>
            )}
            {deleteError && (
              <div
                className="alert alert-danger mt-2"
                role="alert"
                style={{ fontFamily: "Open Sans, sans-serif" }}
              >
                {deleteError}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default VenuePage;
