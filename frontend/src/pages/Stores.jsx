import { useEffect, useState } from "react";
import api from "../services/api";

function Stores() {
  const [stores, setStores] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratingValues, setRatingValues] = useState({});

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/stores", {
        params: {
          name: filters.name,
          address: filters.address,
        },
      });

      const storeData = response.data.data;

      setStores(storeData);

      // Keep the existing rating selected in the dropdown.
      const existingRatings = {};

      storeData.forEach((store) => {
        if (
          store.user_rating !== null &&
          store.user_rating !== undefined
        ) {
          existingRatings[store.id] = String(store.user_rating);
        }
      });

      setRatingValues(existingRatings);
    } catch (error) {
      console.error("Unable to load stores:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load stores."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters.name, filters.address]);

  const handleRatingChange = (storeId, value) => {
    setRatingValues((previousValues) => ({
      ...previousValues,
      [storeId]: value,
    }));
  };

  const handleSubmitRating = async (storeId) => {
    const selectedRating = ratingValues[storeId];
    const rating = Number(selectedRating);

    console.log("1. Rating button clicked");
    console.log("2. Store ID:", storeId);
    console.log("3. Selected rating:", selectedRating);
    console.log("4. Numeric rating:", rating);

    if (!selectedRating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    try {
      setError("");

      const store = stores.find(
        (item) => item.id === storeId
      );

      console.log("5. Store:", store);
      console.log(
        "6. Existing user rating:",
        store?.user_rating
      );

      const hasExistingRating =
        store?.user_rating !== null &&
        store?.user_rating !== undefined;

      if (hasExistingRating) {
        console.log("7. Sending PUT request...");

        const response = await api.put(
          `/stores/${storeId}/ratings`,
          {
            rating,
          }
        );

        console.log("8. PUT response:", response.data);
      } else {
        console.log("7. Sending POST request...");

        const response = await api.post(
          `/stores/${storeId}/ratings`,
          {
            rating,
          }
        );

        console.log("8. POST response:", response.data);
      }

      console.log("9. Refreshing stores...");

      await fetchStores();

      console.log(
        "10. Rating operation completed successfully."
      );
    } catch (error) {
      console.error("11. Rating API error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to submit rating."
      );
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">STORE DIRECTORY</p>

        <h1>
          Find a <em>Store</em>
        </h1>

        <p className="dashboard-subtitle">
          Search stores, view ratings, and share your experience.
        </p>

        {error && (
          <p className="form-error">{error}</p>
        )}

        <div className="stores-filters">
          <input
            type="text"
            name="name"
            placeholder="Search by store name"
            value={filters.name}
            onChange={handleFilterChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Search by address"
            value={filters.address}
            onChange={handleFilterChange}
          />
        </div>

        {loading && (
          <p className="dashboard-subtitle">
            Loading stores...
          </p>
        )}

        {!loading && stores.length === 0 && (
          <p className="dashboard-subtitle">
            No stores found.
          </p>
        )}

        {!loading && stores.length > 0 && (
          <div className="user-stores-grid">
            {stores.map((store) => {
              const hasExistingRating =
                store.user_rating !== null &&
                store.user_rating !== undefined;

              return (
                <article
                  className="user-store-card"
                  key={store.id}
                >
                  <div className="store-card-header">
                    <div>
                      <p className="store-card-label">
                        STORE
                      </p>

                      <h2>{store.name}</h2>
                    </div>

                    <div className="store-rating">
                      <strong>
                        {Number(
                          store.average_rating
                        ).toFixed(1)}
                      </strong>

                      <span>/ 5</span>
                    </div>
                  </div>

                  <p className="store-address">
                    {store.address}
                  </p>

                  <div className="user-rating-section">
                    <div>
                      <span className="rating-label">
                        Your rating
                      </span>

                      <strong>
                        {hasExistingRating
                          ? `${store.user_rating} / 5`
                          : "Not rated yet"}
                      </strong>
                    </div>

                    <div className="rating-controls">
                      <select
                        value={
                          ratingValues[store.id] || ""
                        }
                        onChange={(event) =>
                          handleRatingChange(
                            store.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select rating
                        </option>

                        <option value="1">
                          1 / 5
                        </option>

                        <option value="2">
                          2 / 5
                        </option>

                        <option value="3">
                          3 / 5
                        </option>

                        <option value="4">
                          4 / 5
                        </option>

                        <option value="5">
                          5 / 5
                        </option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          handleSubmitRating(store.id)
                        }
                      >
                        {hasExistingRating
                          ? "Update Rating"
                          : "Submit Rating"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Stores;
