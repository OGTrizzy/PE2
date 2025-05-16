import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchVenueById } from "../api/auth";
import { createBooking, deleteVenue } from "../api/auth";
import { AuthContext } from "../context/authContext";
import Header from "../components/header";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

function VenuePage() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({
    dateFrom: null,
    dateTo: null,
  });
  const [startDate, setStartDate] = useState(null); // tempoary save startdate
  const [tempEvent, setTempEvent] = useState(null); // tempoary event for chosen dates
  const [guests, setGuests] = useState(1);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const calendarRef = useRef(null); // ref for fullcalender

  useEffect(() => {
    const getVenueAndBookings = async () => {
      setLoading(true);
      try {
        const venueData = await fetchVenueById(id);
        setVenue(venueData);
        setBookings(venueData.bookings || []); // get bookings from response Hent
      } catch (error) {
        console.error("Error fetching venue or bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    getVenueAndBookings();
  }, [id]);

  const handleDateClick = (arg) => {
    if (!startDate) {
      // first click sets start date
      setStartDate(arg.date);
      setBookingError(null);

      // add tempoary event before startdate
      const newTempEvent = {
        id: "temp-selection",
        start: arg.date,
        end: arg.date,
        title: "",
        allDay: true,
        backgroundColor: "#4A90E2", // blue for startdate
        borderColor: "#4A90E2",
      };
      setTempEvent(newTempEvent);
    } else {
      // second click completes the choise if first date is chosen
      const endDate = arg.date;
      if (endDate < startDate) {
        setBookingError("End date cannot be before start date.");
        setStartDate(null);
        setTempEvent(null); // remove tempoary event
        return;
      }

      const bookedDates = bookings.flatMap((booking) => {
        const dates = [];
        let currentDate = new Date(booking.dateFrom);
        const endDate = new Date(booking.dateTo);
        while (currentDate <= endDate) {
          dates.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
      });

      const datesInRange = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        datesInRange.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const hasBookedDate = datesInRange.some((date) =>
        bookedDates.includes(date)
      );
      if (hasBookedDate) {
        setBookingError("Some dates in the selected range are already booked.");
        setStartDate(null);
        setTempEvent(null); // remove tempoary date
        return;
      }

      setSelectedDates({
        dateFrom: startDate.toISOString().split("T")[0],
        dateTo: endDate.toISOString().split("T")[0],
      });
      setStartDate(null);

      // update tempoary event to cover whole chosen period
      const updatedTempEvent = {
        id: "temp-selection",
        start: startDate,
        end: new Date(endDate.setDate(endDate.getDate() + 1)),
        title: "",
        allDay: true,
        backgroundColor: "#4A90E2", // blue for chosen period
        borderColor: "#4A90E2",
      };
      setTempEvent(updatedTempEvent);
      setBookingError(null);
    }
  };

  const handleBooking = async () => {
    if (!selectedDates.dateFrom || !selectedDates.dateTo) {
      setBookingError("Please select both a start and end date.");
      return;
    }

    if (guests < 1) {
      setBookingError("Please select at least 1 guest.");
      return;
    }

    const bookingData = {
      dateFrom: selectedDates.dateFrom + "T00:00:00.000Z",
      dateTo: selectedDates.dateTo + "T00:00:00.000Z",
      guests: parseInt(guests),
      venueId: id,
    };

    const result = await createBooking(bookingData);
    if (result.success) {
      setBookingMessage("Booking successful!");
      setSelectedDates({ dateFrom: null, dateTo: null });
      setGuests(1);
      setTempEvent(null); // remove chosen period after booking
      const updatedVenue = await fetchVenueById(id); // fetch updated venue with new bookings
      setVenue(updatedVenue);
      setBookings(updatedVenue.bookings || []);
    } else {
      setBookingError(result.error || "Failed to create booking.");
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

  const events = [
    ...bookings.map((booking) => ({
      start: booking.dateFrom,
      end: new Date(
        new Date(booking.dateTo).setDate(new Date(booking.dateTo).getDate() + 1)
      ),
      title: "Booked",
      allDay: true,
      backgroundColor: "#FF6F61",
      borderColor: "#FF6F61",
    })),
    ...(tempEvent ? [tempEvent] : []), // adds tempary event for chosen period
  ];

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
            <div
              id="venueCarousel"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner">
                {venue.media && venue.media.length > 0 ? (
                  venue.media.slice(0, 4).map((imageObj, index) => (
                    <div
                      key={index}
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                      <img
                        src={imageObj.url}
                        alt={`${venue.name} ${index + 1}`}
                        className="d-block w-100 rounded"
                        style={{ height: "384px", objectFit: "cover" }}
                        onError={(e) => {
                          console.log(`Failed to load image: ${imageObj.url}`);
                          e.target.src =
                            "https://images.unsplash.com/photo-1605537473964-8d8a2673ff7b?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="carousel-item active">
                    <img
                      src="https://via.placeholder.com/800x400"
                      alt={venue.name || "Venue"}
                      className="d-block w-100 rounded"
                      style={{ height: "384px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
              {venue.media && venue.media.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#venueCarousel"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#venueCarousel"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </>
              )}
            </div>
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
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dateClick={handleDateClick}
                selectable={false}
                events={events}
                selectConstraint={{
                  start: new Date(),
                }}
                eventOverlap={false}
                height="auto"
              />
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
              <div className="mt-3">
                <label
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    color: "#333333",
                    marginRight: "10px",
                  }}
                >
                  Number of Guests:
                </label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  min="1"
                  className="form-control"
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    color: "#333333",
                    backgroundColor: "#F5F5F5",
                    borderColor: "#333333",
                    width: "100px",
                    display: "inline-block",
                  }}
                />
              </div>
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
                      backgroundColor: "#FF6F61",
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
