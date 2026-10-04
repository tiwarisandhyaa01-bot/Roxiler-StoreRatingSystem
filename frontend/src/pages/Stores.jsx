import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import {
  SearchIcon,
  PinIcon,
  StarIcon,
  StoreIcon,
  CloseIcon,
  SpinnerIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshIcon,
} from "../components/Icons";

const RATING_DESCRIPTIONS = {
  1: "1 · Poor",
  2: "2 · Fair",
  3: "3 · Average",
  4: "4 · Very Good",
  5: "5 · Excellent",
};

function Stores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingValues, setRatingValues] = useState({});
  const [hoveredRatings, setHoveredRatings] = useState({});
  const [submittingStoreId, setSubmittingStoreId] = useState(null);
  const [storeFeedback, setStoreFeedback] = useState({});

  const hasActiveFilters = Boolean(filters.name.trim() || filters.address.trim());

  const fetchStores = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      setError("");

      const response = await api.get("/stores", {
        params: {
          name: filters.name.trim() || undefined,
          address: filters.address.trim() || undefined,
        },
      });

      const storeData = response.data?.data || [];
      setStores(storeData);

      // Preserve existing ratings in local state
      setRatingValues((previousValues) => {
        const updated = { ...previousValues };
        storeData.forEach((store) => {
          if (store.user_rating !== null && store.user_rating !== undefined) {
            updated[store.id] = Number(store.user_rating);
          }
        });
        return updated;
      });
    } catch (err) {
      console.error("Unable to load stores:", err);
      setError(
        err.response?.data?.message || "Unable to load stores. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.name, filters.address]);

  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchStores();
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fetchStores]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilter = (field) => {
    setFilters((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      name: "",
      address: "",
    });
  };

  const handleStarClick = (storeId, score) => {
    setRatingValues((prev) => ({
      ...prev,
      [storeId]: score,
    }));

    // Clear feedback if any
    setStoreFeedback((prev) => ({
      ...prev,
      [storeId]: null,
    }));
  };

  const handleStarMouseEnter = (storeId, score) => {
    setHoveredRatings((prev) => ({
      ...prev,
      [storeId]: score,
    }));
  };

  const handleStarMouseLeave = (storeId) => {
    setHoveredRatings((prev) => {
      const next = { ...prev };
      delete next[storeId];
      return next;
    });
  };

  const handleSubmitRating = async (storeId) => {
    const selectedRating = ratingValues[storeId];
    const rating = Number(selectedRating);

    if (!selectedRating || rating < 1 || rating > 5) {
      setStoreFeedback((prev) => ({
        ...prev,
        [storeId]: {
          type: "error",
          message: "Please pick a rating between 1 and 5.",
        },
      }));
      return;
    }

    setSubmittingStoreId(storeId);
    setStoreFeedback((prev) => ({
      ...prev,
      [storeId]: null,
    }));

    try {
      const targetStore = stores.find((item) => item.id === storeId);
      const hasExistingRating =
        targetStore?.user_rating !== null && targetStore?.user_rating !== undefined;

      if (hasExistingRating) {
        await api.put(`/stores/${storeId}/ratings`, { rating });
        setStoreFeedback((prev) => ({
          ...prev,
          [storeId]: {
            type: "success",
            message: "Your rating was updated successfully!",
          },
        }));
      } else {
        await api.post(`/stores/${storeId}/ratings`, { rating });
        setStoreFeedback((prev) => ({
          ...prev,
          [storeId]: {
            type: "success",
            message: "Your rating was recorded successfully!",
          },
        }));
      }

      // Refresh stores list to update community average
      await fetchStores();

      // Clear feedback after 4 seconds
      setTimeout(() => {
        setStoreFeedback((prev) => ({
          ...prev,
          [storeId]: null,
        }));
      }, 4000);
    } catch (err) {
      console.error("Rating submission error:", err);
      setStoreFeedback((prev) => ({
        ...prev,
        [storeId]: {
          type: "error",
          message: err.response?.data?.message || "Failed to submit rating. Please try again.",
        },
      }));
    } finally {
      setSubmittingStoreId(null);
    }
  };

  // Helper to render star display for community rating (0 to 5)
  const renderAverageStars = (avgRating) => {
    const num = Number(avgRating) || 0;
    const rounded = Math.round(num * 10) / 10;
    const fullStars = Math.floor(rounded);
    const hasHalf = rounded - fullStars >= 0.5;

    return (
      <div className="store-score-stars" aria-label={`Rating: ${rounded} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((index) => {
          const isFilled = index <= fullStars;
          const isHalf = index === fullStars + 1 && hasHalf;
          return (
            <StarIcon
              key={index}
              size={15}
              filled={isFilled}
              half={isHalf}
              className="score-star-icon"
            />
          );
        })}
      </div>
    );
  };

  return (
    <main className="stores-discovery-layout">
      {/* Product-Oriented Discovery Header */}
      <header className="stores-header-section">
        <span className="stores-eyebrow">
          <StoreIcon size={14} />
          STORE DIRECTORY & COMMUNITY REVIEWS
        </span>

        <h1 className="stores-main-title">Find a place worth your time.</h1>

        <p className="stores-subtitle">
          Explore verified local stores, compare overall customer ratings, and submit your firsthand
          feedback to support community trust.
        </p>

        {/* Global Error Banner */}
        {error && (
          <div className="auth-alert alert-error" role="alert" style={{ marginBottom: "16px" }}>
            <AlertCircleIcon size={18} />
            <div style={{ flex: 1 }}>{error}</div>
            <button
              type="button"
              className="meta-action-btn"
              onClick={() => fetchStores(true)}
              style={{ color: "var(--color-error)" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Context Meta Bar */}
        <div className="stores-meta-bar">
          <div className="stores-meta-left">
            <span className="stores-count-badge">
              <span className="stores-count-indicator" />
              {loading
                ? "Searching stores..."
                : `${stores.length} ${stores.length === 1 ? "store" : "stores"} available`}
            </span>

            {hasActiveFilters && (
              <span className="stores-filter-tag">
                Filtered by {filters.name.trim() ? `name: "${filters.name}"` : ""}
                {filters.name.trim() && filters.address.trim() ? " & " : ""}
                {filters.address.trim() ? `location: "${filters.address}"` : ""}
              </span>
            )}
          </div>

          <div className="stores-meta-right">
            {hasActiveFilters && (
              <button
                type="button"
                className="meta-action-btn"
                onClick={handleClearAllFilters}
                aria-label="Clear all active search filters"
              >
                <CloseIcon size={14} />
                Clear Filters
              </button>
            )}

            <button
              type="button"
              className="meta-action-btn"
              onClick={() => fetchStores(true)}
              disabled={loading || refreshing}
              title="Refresh store listings"
            >
              {refreshing ? <SpinnerIcon size={14} /> : <RefreshIcon size={14} />}
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* Search & Discovery Panel */}
      <section className="stores-search-container" aria-label="Store search filters">
        <div className="search-inputs-grid">
          {/* Store Name Filter */}
          <div className="search-field-wrapper">
            <span className="search-field-icon">
              <SearchIcon size={18} />
            </span>
            <input
              id="filter-store-name"
              type="text"
              name="name"
              className="search-input-control"
              placeholder="Search by store name..."
              value={filters.name}
              onChange={handleFilterChange}
              autoComplete="off"
            />
            {filters.name && (
              <button
                type="button"
                className="search-field-clear"
                onClick={() => handleClearFilter("name")}
                aria-label="Clear store name search"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {/* Address / Location Filter */}
          <div className="search-field-wrapper">
            <span className="search-field-icon">
              <PinIcon size={18} />
            </span>
            <input
              id="filter-store-address"
              type="text"
              name="address"
              className="search-input-control"
              placeholder="Filter by address or location..."
              value={filters.address}
              onChange={handleFilterChange}
              autoComplete="off"
            />
            {filters.address && (
              <button
                type="button"
                className="search-field-clear"
                onClick={() => handleClearFilter("address")}
                aria-label="Clear address search"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Store Listings Grid */}
      <section aria-label="Available Stores">
        {/* Loading Skeleton State */}
        {loading && (
          <div className="stores-grid">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="store-card-skeleton">
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div
                    className="skeleton-shimmer"
                    style={{ width: "44px", height: "44px", borderRadius: "8px" }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                      className="skeleton-shimmer"
                      style={{ height: "18px", width: "65%", borderRadius: "4px" }}
                    />
                    <div
                      className="skeleton-shimmer"
                      style={{ height: "14px", width: "45%", borderRadius: "4px" }}
                    />
                  </div>
                </div>
                <div
                  className="skeleton-shimmer"
                  style={{ height: "40px", width: "100%", borderRadius: "6px" }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{ height: "36px", width: "100%", borderRadius: "6px" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && stores.length === 0 && (
          <div className="stores-empty-state">
            <div className="stores-empty-icon-wrap">
              <SearchIcon size={24} />
            </div>
            <h2 className="stores-empty-title">No matching stores found</h2>
            <p className="stores-empty-desc">
              {hasActiveFilters
                ? "We could not find any stores matching your current search parameters. Try adjusting your search query or reset your filters."
                : "There are currently no stores available in the directory."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className="stores-empty-action"
                onClick={handleClearAllFilters}
              >
                <CloseIcon size={14} />
                Clear Search Filters
              </button>
            )}
          </div>
        )}

        {/* Stores Grid */}
        {!loading && stores.length > 0 && (
          <div className="stores-grid">
            {stores.map((store) => {
              const hasExistingRating =
                store.user_rating !== null && store.user_rating !== undefined;

              const activeScore =
                hoveredRatings[store.id] ||
                ratingValues[store.id] ||
                (hasExistingRating ? Number(store.user_rating) : 0);

              const isSubmitting = submittingStoreId === store.id;
              const feedback = storeFeedback[store.id];
              const avgScore = Number(store.average_rating) || 0;

              return (
                <article className="store-card-modern" key={store.id}>
                  {/* Top: Identity & Community Score */}
                  <div className="store-card-top">
                    <div className="store-identity-group">
                      <div className="store-monogram" aria-hidden="true">
                        {store.name ? store.name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div className="store-info-text">
                        <h2 className="store-card-name">{store.name}</h2>
                        <p className="store-card-address">
                          <PinIcon size={15} />
                          <span>{store.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="store-score-badge">
                      <div className="store-score-top">
                        <span className="store-score-number">
                          {avgScore > 0 ? avgScore.toFixed(1) : "—"}
                        </span>
                        <span className="store-score-scale">/ 5</span>
                      </div>
                      {renderAverageStars(avgScore)}
                      <span className="store-score-label">Community Score</span>
                    </div>
                  </div>

                  {/* User Personal Rating Status */}
                  <div className="store-user-status-section">
                    <div
                      className={`store-status-pill ${
                        hasExistingRating ? "rated" : "unrated"
                      }`}
                    >
                      {hasExistingRating ? (
                        <>
                          <CheckCircleIcon size={14} />
                          <span>Your Rating: {store.user_rating} / 5</span>
                        </>
                      ) : (
                        <>
                          <StarIcon size={14} />
                          <span>Not rated by you yet</span>
                        </>
                      )}
                    </div>

                    <span className="store-status-hint">
                      {hasExistingRating
                        ? "Update rating below"
                        : "Rate this store"}
                    </span>
                  </div>

                  {/* Interactive Star Rating Selector & Actions */}
                  <div className="store-interactive-rating-area">
                    <div className="rating-selection-header">
                      <span className="rating-prompt-label">
                        {hasExistingRating ? "Modify Your Rating" : "Select Your Rating"}
                      </span>
                      <span className="rating-verbal-hint">
                        {activeScore > 0
                          ? RATING_DESCRIPTIONS[activeScore]
                          : "Click a star to rate"}
                      </span>
                    </div>

                    {/* Star Buttons (1 to 5) */}
                    <div
                      className="star-rating-selector"
                      role="radiogroup"
                      aria-label={`Select rating for ${store.name}`}
                    >
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isSelected = ratingValues[store.id] === starValue;
                        const isHovered = hoveredRatings[store.id] >= starValue;
                        const isFilled =
                          (hoveredRatings[store.id] ? hoveredRatings[store.id] >= starValue : ratingValues[store.id] >= starValue) ||
                          (!ratingValues[store.id] && hasExistingRating && Number(store.user_rating) >= starValue);

                        return (
                          <button
                            key={starValue}
                            type="button"
                            className={`star-btn ${isSelected ? "active" : ""} ${
                              isHovered ? "hovered" : ""
                            }`}
                            onClick={() => handleStarClick(store.id, starValue)}
                            onMouseEnter={() => handleStarMouseEnter(store.id, starValue)}
                            onMouseLeave={() => handleStarMouseLeave(store.id)}
                            aria-label={`${starValue} out of 5 stars`}
                            aria-pressed={isSelected}
                          >
                            <StarIcon
                              size={18}
                              filled={isFilled}
                              className="interactive-star-icon"
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom Action Row: Submit/Update Button & Inline Feedback */}
                    <div className="store-action-row">
                      <button
                        type="button"
                        className={`submit-rating-btn ${
                          hasExistingRating ? "btn-update" : ""
                        }`}
                        onClick={() => handleSubmitRating(store.id)}
                        disabled={isSubmitting || !ratingValues[store.id]}
                      >
                        {isSubmitting ? (
                          <>
                            <SpinnerIcon size={14} />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <StarIcon size={14} filled={Boolean(ratingValues[store.id])} />
                            <span>{hasExistingRating ? "Update Rating" : "Submit Rating"}</span>
                          </>
                        )}
                      </button>

                      {feedback && (
                        <div className={`store-inline-feedback ${feedback.type}`}>
                          {feedback.type === "success" ? (
                            <CheckCircleIcon size={14} />
                          ) : (
                            <AlertCircleIcon size={14} />
                          )}
                          <span>{feedback.message}</span>
                        </div>
                      )}
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
