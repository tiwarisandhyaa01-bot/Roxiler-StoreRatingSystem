import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  UsersIcon,
  StoreIcon,
  StarIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  RefreshIcon,
  SpinnerIcon,
} from "../components/Icons";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setError("");

    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data?.data || null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(
        err.response?.data?.message || "Unable to load operational dashboard metrics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchDashboard();
      }
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fetchDashboard]);

  // Support both snake_case from DB and camelCase
  const totalUsers = stats?.total_users ?? stats?.totalUsers ?? 0;
  const totalStores = stats?.total_stores ?? stats?.totalStores ?? 0;
  const totalRatings = stats?.total_ratings ?? stats?.totalRatings ?? 0;

  return (
    <main className="admin-console-layout">
      {/* Header with Title and Quick Dispatch Actions */}
      <header className="admin-header-flex">
        <div className="admin-header-main">
          <span className="admin-eyebrow">
            <StoreIcon size={14} />
            INTERNAL OPERATIONS CONSOLE
          </span>
          <h1 className="admin-main-title">Operations Overview</h1>
          <p className="admin-subtitle">
            Real-time platform metrics and administrative dispatch across user accounts, merchant
            storefronts, and community reviews.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fetchDashboard(true)}
            disabled={loading || refreshing}
            title="Refresh dashboard metrics"
          >
            {refreshing ? <SpinnerIcon size={14} /> : <RefreshIcon size={14} />}
            <span>{refreshing ? "Refreshing..." : "Refresh Metrics"}</span>
          </button>

          <Link to="/admin/users/add" className="admin-btn-secondary">
            + Onboard User
          </Link>

          <Link to="/admin/stores/add" className="admin-btn-primary">
            + Register Store
          </Link>
        </div>
      </header>

      {/* Error Notice */}
      {error && (
        <div className="auth-alert alert-error" role="alert" style={{ marginBottom: "24px" }}>
          <AlertCircleIcon size={18} />
          <div style={{ flex: 1 }}>{error}</div>
          <button
            type="button"
            className="meta-action-btn"
            onClick={() => fetchDashboard(true)}
            style={{ color: "var(--color-error)" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Key Metrics Strip */}
      <section aria-label="Key Platform Metrics">
        <div className="admin-metrics-grid">
          {/* Total Users */}
          <article className="admin-metric-card">
            <div>
              <div className="admin-metric-top">
                <span className="admin-metric-tag">User Accounts</span>
                <div className="admin-metric-icon-wrap">
                  <UsersIcon size={20} />
                </div>
              </div>
              <div className="admin-metric-value">
                {loading ? "—" : totalUsers}
              </div>
              <p className="admin-metric-label">
                Registered platform accounts across Administrators, Store Owners, and Normal Users.
              </p>
            </div>
            <div className="admin-metric-footer">
              <Link to="/admin/users" className="admin-metric-link">
                <span>Manage Users</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </article>

          {/* Total Stores */}
          <article className="admin-metric-card">
            <div>
              <div className="admin-metric-top">
                <span className="admin-metric-tag">Merchant Stores</span>
                <div className="admin-metric-icon-wrap">
                  <StoreIcon size={20} />
                </div>
              </div>
              <div className="admin-metric-value">
                {loading ? "—" : totalStores}
              </div>
              <p className="admin-metric-label">
                Active merchant physical storefront locations configured in the system directory.
              </p>
            </div>
            <div className="admin-metric-footer">
              <Link to="/admin/stores" className="admin-metric-link">
                <span>Manage Stores</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </article>

          {/* Total Ratings */}
          <article className="admin-metric-card">
            <div>
              <div className="admin-metric-top">
                <span className="admin-metric-tag">Community Reviews</span>
                <div
                  className="admin-metric-icon-wrap"
                  style={{ background: "#fef3c7", color: "#d97706" }}
                >
                  <StarIcon size={20} filled />
                </div>
              </div>
              <div className="admin-metric-value">
                {loading ? "—" : totalRatings}
              </div>
              <p className="admin-metric-label">
                Firsthand community ratings submitted by authenticated customers.
              </p>
            </div>
            <div className="admin-metric-footer">
              <Link to="/admin/stores" className="admin-metric-link">
                <span>View Store Ratings</span>
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Operational Workflows Area */}
      <section aria-label="Management Workflows">
        <div className="admin-workflows-grid">
          {/* User Operations */}
          <article className="admin-workflow-card">
            <div className="workflow-header">
              <div className="workflow-icon-wrap">
                <UsersIcon size={22} />
              </div>
              <div className="workflow-title-wrap">
                <h2>User Directory & Access Control</h2>
                <p>
                  Inspect user accounts, manage role permissions, and provision new administrative,
                  merchant, or consumer identities.
                </p>
              </div>
            </div>

            <div className="workflow-actions">
              <Link to="/admin/users" className="admin-btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                Browse User Directory
              </Link>
              <Link to="/admin/users/add" className="admin-btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                + Onboard User
              </Link>
            </div>
          </article>

          {/* Store Operations */}
          <article className="admin-workflow-card">
            <div className="workflow-header">
              <div className="workflow-icon-wrap">
                <StoreIcon size={22} />
              </div>
              <div className="workflow-title-wrap">
                <h2>Store Management & Ratings</h2>
                <p>
                  Supervise registered merchant storefronts, inspect aggregate community scores, and
                  assign store management to verified owners.
                </p>
              </div>
            </div>

            <div className="workflow-actions">
              <Link to="/admin/stores" className="admin-btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                Browse Store Directory
              </Link>
              <Link to="/admin/stores/add" className="admin-btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                + Register Store
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* System Status Strip */}
      <aside className="admin-status-strip">
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="status-dot-active" />
          <span>Operational console active · Role authorization enforced · Database synchronized</span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          Roxiler Operations Engine v1.0
        </span>
      </aside>
    </main>
  );
}

export default AdminDashboard;