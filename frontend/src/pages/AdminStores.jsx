import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  StoreIcon,
  SearchIcon,
  MailIcon,
  PinIcon,
  CloseIcon,
  StarIcon,
  SpinnerIcon,
  RefreshIcon,
  AlertCircleIcon,
  UserIcon,
} from "../components/Icons";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const hasActiveFilters = Boolean(
    filters.name.trim() || filters.email.trim() || filters.address.trim()
  );

  const fetchStores = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setError("");

    try {
      const response = await api.get("/admin/stores", {
        params: {
          sortBy,
          order,
        },
      });
      setStores(response.data?.data || []);
    } catch (err) {
      console.error("Unable to load stores:", err);
      setError(err.response?.data?.message || "Unable to fetch store directory.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy, order]);

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchStores();
      }
    }, 100);

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
      email: "",
      address: "",
    });
  };

  const handleViewStore = async (storeId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(`/admin/stores/${storeId}`);
      setSelectedStore(response.data?.data || null);
    } catch (err) {
      console.error("Failed to load store details:", err);
      setError(err.response?.data?.message || "Failed to load store details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Client-side filtering based on name, email, address
  const filteredStores = stores.filter((store) => {
    const matchesName = store.name
      ?.toLowerCase()
      .includes(filters.name.trim().toLowerCase());
    const matchesEmail = store.email
      ?.toLowerCase()
      .includes(filters.email.trim().toLowerCase());
    const matchesAddress = store.address
      ?.toLowerCase()
      .includes(filters.address.trim().toLowerCase());

    return matchesName && matchesEmail && matchesAddress;
  });

  return (
    <main className="admin-console-layout">
      {/* Header */}
      <header className="admin-header-flex">
        <div className="admin-header-main">
          <span className="admin-eyebrow">
            <StoreIcon size={14} />
            MERCHANT DIRECTORY
          </span>
          <h1 className="admin-main-title">Store Management</h1>
          <p className="admin-subtitle">
            Review registered merchant storefronts, business contact emails, and aggregate community
            ratings.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fetchStores(true)}
            disabled={loading || refreshing}
            title="Refresh store listings"
          >
            {refreshing ? <SpinnerIcon size={14} /> : <RefreshIcon size={14} />}
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link to="/admin/stores/add" className="admin-btn-primary">
            + Register Store
          </Link>
        </div>
      </header>

      {/* Error Notice */}
      {error && (
        <div className="auth-alert alert-error" role="alert" style={{ marginBottom: "20px" }}>
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

      {/* Search and Filters Toolbar */}
      <section className="admin-filter-bar" aria-label="Store search filters">
        {/* Name Search */}
        <div className="filter-input-wrap">
          <span className="filter-input-icon">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            name="name"
            placeholder="Search by store name..."
            className="filter-input"
            value={filters.name}
            onChange={handleFilterChange}
            autoComplete="off"
          />
          {filters.name && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => handleClearFilter("name")}
              aria-label="Clear name search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Email Search */}
        <div className="filter-input-wrap">
          <span className="filter-input-icon">
            <MailIcon size={16} />
          </span>
          <input
            type="text"
            name="email"
            placeholder="Search by email..."
            className="filter-input"
            value={filters.email}
            onChange={handleFilterChange}
            autoComplete="off"
          />
          {filters.email && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => handleClearFilter("email")}
              aria-label="Clear email search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Address Search */}
        <div className="filter-input-wrap">
          <span className="filter-input-icon">
            <PinIcon size={16} />
          </span>
          <input
            type="text"
            name="address"
            placeholder="Search address..."
            className="filter-input"
            value={filters.address}
            onChange={handleFilterChange}
            autoComplete="off"
          />
          {filters.address && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => handleClearFilter("address")}
              aria-label="Clear address search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Sort By Field */}
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="filter-select"
          aria-label="Sort stores by"
        >
          <option value="name">Sort by Name</option>
          <option value="address">Sort by Address</option>
          <option value="average_rating">Sort by Rating</option>
        </select>

        {/* Sort Order */}
        <select
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          className="filter-select"
          aria-label="Sort order"
        >
          <option value="asc">Ascending ↑</option>
          <option value="desc">Descending ↓</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="meta-action-btn"
            onClick={handleClearAllFilters}
            aria-label="Reset all search filters"
          >
            <CloseIcon size={14} />
            Reset Filters
          </button>
        )}
      </section>

      {/* Stores Count Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)" }}>
          Showing {filteredStores.length} of {stores.length} merchant stores
        </span>
      </div>

      {/* Stores Data Table */}
      <section className="admin-table-wrapper" aria-label="Stores Table">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Store Identity</th>
                <th>Business Email</th>
                <th>Physical Address</th>
                <th>Community Rating</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "36px", color: "var(--color-text-muted)" }}>
                    <SpinnerIcon size={18} />
                    <span style={{ marginLeft: "8px" }}>Loading store directory...</span>
                  </td>
                </tr>
              )}

              {!loading && filteredStores.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px 16px" }}>
                    <p style={{ fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "4px" }}>
                      No matching stores found
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                      {hasActiveFilters
                        ? "Try adjusting your query or resetting filters."
                        : "There are no stores configured in the directory yet."}
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredStores.map((store) => {
                  const ratingNum = Number(store.average_rating) || 0;
                  return (
                    <tr key={store.id}>
                      <td>
                        <div className="table-user-cell">
                          <div className="table-user-monogram" aria-hidden="true">
                            {store.name ? store.name.charAt(0).toUpperCase() : "S"}
                          </div>
                          <span className="table-user-name">{store.name}</span>
                        </div>
                      </td>
                      <td>{store.email}</td>
                      <td style={{ maxWidth: "260px", wordBreak: "break-word" }}>{store.address}</td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12.5px",
                              fontWeight: "700",
                              color: ratingNum > 0 ? "#b45309" : "var(--color-text-muted)",
                              background: ratingNum > 0 ? "#fffbeb" : "var(--color-surface-subtle)",
                              border: `1px solid ${ratingNum > 0 ? "#fde68a" : "var(--color-border)"}`,
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            <StarIcon size={13} filled={ratingNum > 0} />
                            <span>{ratingNum > 0 ? ratingNum.toFixed(1) : "Unrated"}</span>
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => handleViewStore(store.id)}
                          disabled={loadingDetails}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Store Inspection Modal */}
      {selectedStore && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedStore(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-store-title"
          >
            <div className="admin-modal-header">
              <h2 id="modal-store-title" className="admin-modal-title">
                Store Record Inspection
              </h2>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedStore(null)}
                aria-label="Close modal"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="detail-row">
                <span className="detail-key">Store Name</span>
                <span className="detail-val">{selectedStore.name}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">Store ID</span>
                <span className="detail-val">#{selectedStore.id}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">Business Email</span>
                <span className="detail-val">{selectedStore.email}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">Physical Location</span>
                <span className="detail-val">{selectedStore.address}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">Community Rating</span>
                <span className="detail-val" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <StarIcon size={14} filled style={{ color: "#f59e0b" }} />
                  <span>
                    {Number(selectedStore.average_rating) > 0
                      ? `${Number(selectedStore.average_rating).toFixed(1)} / 5.0 (${selectedStore.total_ratings ?? 0} reviews)`
                      : "No ratings yet"}
                  </span>
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-key">Assigned Owner</span>
                <span className="detail-val" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <UserIcon size={14} />
                  <span>{selectedStore.owner_name ? selectedStore.owner_name : "Unassigned"}</span>
                </span>
              </div>

              {selectedStore.owner_email && (
                <div className="detail-row">
                  <span className="detail-key">Owner Email</span>
                  <span className="detail-val">{selectedStore.owner_email}</span>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedStore(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminStores;