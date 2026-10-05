import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  UsersIcon,
  SearchIcon,
  MailIcon,
  PinIcon,
  CloseIcon,
  StarIcon,
  SpinnerIcon,
  RefreshIcon,
  AlertCircleIcon,
} from "../components/Icons";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const hasActiveFilters = Boolean(
    filters.name.trim() || filters.email.trim() || filters.address.trim() || filters.role
  );

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setError("");

    try {
      const response = await api.get("/admin/users", {
        params: {
          sortBy,
          order,
        },
      });
      setUsers(response.data?.data || []);
    } catch (err) {
      console.error("Unable to load users:", err);
      setError(err.response?.data?.message || "Unable to fetch user records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy, order]);

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchUsers();
      }
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fetchUsers]);

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
      role: "",
    });
  };

  const handleViewUser = async (userId) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data?.data || null);
    } catch (err) {
      console.error("Failed to load user details:", err);
      setError(err.response?.data?.message || "Failed to load user details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Client-side filtering based on name, email, address, role
  const filteredUsers = users.filter((user) => {
    const matchesName = user.name
      ?.toLowerCase()
      .includes(filters.name.trim().toLowerCase());
    const matchesEmail = user.email
      ?.toLowerCase()
      .includes(filters.email.trim().toLowerCase());
    const matchesAddress = user.address
      ?.toLowerCase()
      .includes(filters.address.trim().toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;

    return matchesName && matchesEmail && matchesAddress && matchesRole;
  });

  const getRoleBadge = (role) => {
    if (role === "ADMIN") {
      return <span className="role-badge role-admin">Administrator</span>;
    }
    if (role === "STORE_OWNER") {
      return <span className="role-badge role-owner">Store Owner</span>;
    }
    return <span className="role-badge role-user">Normal User</span>;
  };

  return (
    <main className="admin-console-layout">
      {/* Header */}
      <header className="admin-header-flex">
        <div className="admin-header-main">
          <span className="admin-eyebrow">
            <UsersIcon size={14} />
            USER DIRECTORY & ACCESS CONTROL
          </span>
          <h1 className="admin-main-title">User Management</h1>
          <p className="admin-subtitle">
            Search, filter, and inspect registered user accounts and system role assignments.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fetchUsers(true)}
            disabled={loading || refreshing}
            title="Refresh user list"
          >
            {refreshing ? <SpinnerIcon size={14} /> : <RefreshIcon size={14} />}
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link to="/admin/users/add" className="admin-btn-primary">
            + Onboard User
          </Link>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="auth-alert alert-error" role="alert" style={{ marginBottom: "20px" }}>
          <AlertCircleIcon size={18} />
          <div style={{ flex: 1 }}>{error}</div>
          <button
            type="button"
            className="meta-action-btn"
            onClick={() => fetchUsers(true)}
            style={{ color: "var(--color-error)" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="admin-filter-bar" aria-label="User search filters">
        {/* Name Search */}
        <div className="filter-input-wrap">
          <span className="filter-input-icon">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            name="name"
            placeholder="Search by name..."
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

        {/* Role Select */}
        <select
          name="role"
          className="filter-select"
          value={filters.role}
          onChange={handleFilterChange}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Administrator</option>
          <option value="STORE_OWNER">Store Owner</option>
          <option value="USER">Normal User</option>
        </select>

        {/* Sort Field */}
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="filter-select"
          aria-label="Sort users by"
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="address">Sort by Address</option>
          <option value="role">Sort by Role</option>
        </select>

        {/* Order */}
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

      {/* Users Count Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)" }}>
          Showing {filteredUsers.length} of {users.length} registered users
        </span>
      </div>

      {/* Users Data Table */}
      <section className="admin-table-wrapper" aria-label="Users Table">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Physical Address</th>
                <th>System Role</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "36px", color: "var(--color-text-muted)" }}>
                    <SpinnerIcon size={18} />
                    <span style={{ marginLeft: "8px" }}>Loading user directory...</span>
                  </td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px 16px" }}>
                    <p style={{ fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "4px" }}>
                      No matching user records found
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                      {hasActiveFilters
                        ? "Try adjusting your query or resetting filters."
                        : "There are no users registered yet."}
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-user-cell">
                        <div className="table-user-monogram" aria-hidden="true">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="table-user-name">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td style={{ maxWidth: "240px", wordBreak: "break-word" }}>{user.address}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => handleViewUser(user.id)}
                        disabled={loadingDetails}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-user-title"
          >
            <div className="admin-modal-header">
              <h2 id="modal-user-title" className="admin-modal-title">
                User Record Inspection
              </h2>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedUser(null)}
                aria-label="Close modal"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="detail-row">
                <span className="detail-key">Account Holder</span>
                <span className="detail-val">{selectedUser.name}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">User ID</span>
                <span className="detail-val">#{selectedUser.id}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">Email Address</span>
                <span className="detail-val">{selectedUser.email}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">System Role</span>
                <span className="detail-val">{getRoleBadge(selectedUser.role)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-key">Registered Address</span>
                <span className="detail-val">{selectedUser.address}</span>
              </div>

              {selectedUser.role === "STORE_OWNER" && (
                <>
                  <div className="detail-row">
                    <span className="detail-key">Assigned Store</span>
                    <span className="detail-val">
                      {selectedUser.store_name ? selectedUser.store_name : "None assigned"}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-key">Overall Rating</span>
                    <span className="detail-val" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <StarIcon size={14} filled style={{ color: "var(--color-rating)" }} />
                      <span>
                        {Number(selectedUser.rating) > 0
                          ? `${Number(selectedUser.rating).toFixed(1)} / 5.0`
                          : "No ratings yet"}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedUser(null)}
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

export default AdminUsers;