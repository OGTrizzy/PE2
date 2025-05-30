import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchVenues } from "../api/venues";
import Header from "../components/header.js";

// helper function to sort venues—keeps things neat
const sortVenues = (venues, criteria, order) => {
  const sortedVenues = [...venues];
  switch (criteria) {
    case "price":
      sortedVenues.sort((a, b) =>
        order === "asc" ? a.price - b.price : b.price - a.price
      );
      break;
    case "maxGuests":
      sortedVenues.sort((a, b) =>
        order === "asc" ? a.maxGuests - b.maxGuests : b.maxGuests - a.maxGuests
      );
      break;
    case "rating":
      sortedVenues.sort((a, b) =>
        order === "asc" ? a.rating - b.rating : b.rating - a.rating
      );
      break;
    case "created":
    default:
      sortedVenues.sort((a, b) => new Date(b.created) - new Date(a.created));
      break;
  }
  return sortedVenues;
};

function HomePage() {
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");

  // load all venues when the page mounts
  useEffect(() => {
    const getVenues = async () => {
      setLoading(true);
      const data = await searchVenues("");
      const sortedData = sortVenues(data, sortCriteria, sortOrder);
      setFilteredVenues(sortedData);
      setLoading(false);
    };
    getVenues();
    // eslint-disable-next-line
  }, []);

  // handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const results = await searchVenues(searchQuery);
    const sortedResults = sortVenues(results, sortCriteria, sortOrder);
    setFilteredVenues(sortedResults);
    setLoading(false);
  };

  // handle sort dropdown change
  const handleSortChange = (e) => {
    const [criteria, order] = e.target.value.split("-");
    setSortCriteria(criteria);
    setSortOrder(order);
    const sortedVenues = sortVenues(filteredVenues, criteria, order);
    setFilteredVenues(sortedVenues);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <Header />
      <main className="p-4">
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <form onSubmit={handleSearch} className="mb-4">
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

          {/* sort dropdown, nice and centered */}
          <div className="mb-4" style={{ maxWidth: "300px", margin: "0 auto" }}>
            <select
              value={`${sortCriteria}-${sortOrder}`}
              onChange={handleSortChange}
              className="form-select"
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#333333",
                backgroundColor: "#F5F5F5",
                borderColor: "#333333",
              }}
            >
              <option value="created-desc">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="maxGuests-asc">Max Guests: Low to High</option>
              <option value="maxGuests-desc">Max Guests: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
            </select>
          </div>

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
                        venue.media && venue.media[0]
                          ? typeof venue.media[0] === "string"
                            ? venue.media[0]
                            : venue.media[0]?.url ||
                              "https://images.unsplash.com/photo-1605537473964-8d8a2673ff7b?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                          : "https://images.unsplash.com/photo-1605537473964-8d8a2673ff7b?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      }
                      alt={venue.name}
                      className="card-img-top"
                      style={{ height: "160px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1605537473964-8d8a2673ff7b?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                      }}
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
                      <p
                        className="card-text"
                        style={{
                          fontFamily: "Open Sans, sans-serif",
                          color: "#333333",
                          fontSize: "0.875rem",
                        }}
                      >
                        Guests: {venue.maxGuests}
                      </p>
                      <p
                        className="card-text"
                        style={{
                          fontFamily: "Open Sans, sans-serif",
                          color: "#333333",
                          fontSize: "0.875rem",
                        }}
                      >
                        Rating: {venue.rating || "N/A"}
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
        </div>
      </main>
    </div>
  );
}

export default HomePage;
