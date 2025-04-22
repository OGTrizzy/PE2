import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchVenues } from "../api/venues";

function HomePage() {
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVenues = async () => {
      const data = await searchVenues("");
      console.log("Data from searchVenues:", data);
      setFilteredVenues(data);
      setLoading(false);
    };
    getVenues();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const results = await searchVenues(searchQuery);
    console.log("Search results:", results);
    setFilteredVenues(results);
    setLoading(false);
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
      <main className="p-4">
        <form
          onSubmit={handleSearch}
          className="mb-4"
          style={{ maxWidth: "960px", margin: "0 auto" }}
        >
          <input
            type="text"
            placeholder="Search for venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control mb-2"
            style={{
              fontFamily: "Open Sans, sans-serif",
              color: "#333333",
              backgroundColor: "#F5F5F5",
              borderColor: "#333333",
            }}
          />
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
            Search
          </button>
        </form>
        {loading ? (
          <p
            className="text-center"
            style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
          >
            Loading venues...
          </p>
        ) : !Array.isArray(filteredVenues) || filteredVenues.length === 0 ? (
          <p
            className="text-center"
            style={{ fontFamily: "Open Sans, sans-serif", color: "#333333" }}
          >
            No venues found.
          </p>
        ) : (
          <div
            className="row row-cols-1 row-cols-md-3 g-4"
            style={{ maxWidth: "1280px", margin: "0 auto" }}
          >
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="col">
                <div className="card h-100 shadow-sm">
                  <img
                    src={
                      venue.media?.[0] || "https://via.placeholder.com/250x150"
                    }
                    alt={venue.name}
                    className="card-img-top"
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h2
                      className="card-title"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: "bold",
                        color: "#333333",
                        fontSize: "1.125rem",
                      }}
                    >
                      {venue.name}
                    </h2>
                    <p
                      className="card-text"
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
                      className="btn w-100"
                      style={{
                        backgroundColor: "#FF6F61",
                        color: "white",
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: "bold",
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
