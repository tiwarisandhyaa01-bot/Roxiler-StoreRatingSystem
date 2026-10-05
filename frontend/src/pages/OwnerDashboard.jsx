import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import {
  StoreIcon,
  StarIcon,
  MailIcon,
  PinIcon,
  RefreshIcon,
  SpinnerIcon,
  AlertCircleIcon,
  UserIcon,
} from "../components/Icons";

function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [noStoreAssigned, setNoStoreAssigned] = useState(false);

  const fetchOwnerDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    setError("");
    setNoStoreAssigned(false);

    try {
      const response = await api.get("/owner/dashboard");
      setDashboardData(response.data?.data || null);
    } catch (err) {
      console.error("Unable to load store owner dashboard:", err);
      if (err.response?.status === 404) {
        setNoStoreAssigned(true);
      } else {
        setError(
          err.response?.data?.message || "Unable to load store owner dashboard data."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchOwnerDashboard();
      }
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fetchOwnerDashboard]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (score) => {
    const num = Number(score) || 0;
    const rounded = Math.round(num * 10) / 10;
    const fullStars = Math.floor(rounded);
    const hasHalf = rounded - fullStars >= 0.5;

    return (
      <div className="owner-stars-display" aria-label={`Rating: ${rounded} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((index) => {
          const isFilled = index <= fullStars;
          const isHalf = index === fullStars + 1 && hasHalf;
          return (
            <StarIcon
              key={index}
              size={18}
              filled={isFilled}
              half={isHalf}
              className="owner-star-icon"
            />
          );
        })}
      </div>
    );
  };

  const totalRatingsNum = Number(dashboardData?.totalRatings) || 0;
  const avgRatingNum = Number(dashboardData?.averageRating) || 0;

  return (
    <main className="owner-workspace-layout">
      {/* Page Header */}
      <header className="owner-header-flex">
        <div className="owner-header-main">
          <span className="owner-eyebrow">
            <StoreIcon size={14} />
            STORE OWNER WORKSPACE
          </span>
          <h1 className="owner-main-title">Your store at a glance</h1>
          <p className="owner-subtitle">
            Monitor customer reviews, track community rating averages, and inspect individual customer
            ratings for your storefront.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => fetchOwnerDashboard(true)}
            disabled={loading || refreshing}
            title="Refresh dashboard data"
          >
            {refreshing ? <SpinnerIcon size={14} /> : <RefreshIcon size={14} />}
            <span>{refreshing ? "Refreshing..." : "Refresh Feedback"}</span>
          </button>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="auth-alert alert-error" role="alert" style={{ marginBottom: "24px" }}>
          <AlertCircleIcon size={18} />
          <div style={{ flex: 1 }}>{error}</div>
          <button
            type="button"
            className="meta-action-btn"
            onClick={() => fetchOwnerDashboard(true)}
            style={{ color: "var(--color-error)" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* No Store Assigned Banner (404) */}
      {noStoreAssigned && !loading && (
        <div className="owner-no-store-panel">
          <div className="owner-empty-icon-wrap" style={{ background: "var(--color-surface-subtle)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}>
            <StoreIcon size={24} />
          </div>
          <h2 className="owner-empty-title">No Store Assigned Yet</h2>
          <p className="owner-empty-desc">
            Your account is registered as a Store Owner, but no store location has been linked to your
            profile yet. Please contact a platform Administrator to register and assign your storefront.
          </p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div>
          {/* Identity Skeleton */}
          <div className="store-card-skeleton" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div
                className="skeleton-shimmer"
                style={{ width: "52px", height: "52px", borderRadius: "8px" }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div
                  className="skeleton-shimmer"
                  style={{ height: "20px", width: "40%", borderRadius: "4px" }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{ height: "14px", width: "60%", borderRadius: "4px" }}
                />
              </div>
            </div>
          </div>

          {/* Metrics Skeleton */}
          <div className="owner-metrics-grid">
            <div className="store-card-skeleton">
              <div className="skeleton-shimmer" style={{ height: "14px", width: "30%", marginBottom: "12px" }} />
              <div className="skeleton-shimmer" style={{ height: "36px", width: "40%", marginBottom: "12px" }} />
              <div className="skeleton-shimmer" style={{ height: "14px", width: "70%" }} />
            </div>
            <div className="store-card-skeleton">
              <div className="skeleton-shimmer" style={{ height: "14px", width: "30%", marginBottom: "12px" }} />
              <div className="skeleton-shimmer" style={{ height: "36px", width: "40%", marginBottom: "12px" }} />
              <div className="skeleton-shimmer" style={{ height: "14px", width: "70%" }} />
            </div>
          </div>
        </div>
      )}

      {/* Loaded Store Owner Content */}
      {!loading && dashboardData && (
        <>
          {/* 1. Store Identity Section */}
          <section className="owner-store-identity-panel" aria-label="Store Identity">
            <div className="owner-store-left">
              <div className="owner-store-monogram" aria-hidden="true">
                {dashboardData.store?.name ? dashboardData.store.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="owner-store-details">
                <h2 className="owner-store-name">{dashboardData.store?.name}</h2>
                <div className="owner-store-meta-grid">
                  <div className="owner-store-meta-item">
                    <MailIcon size={15} />
                    <span>{dashboardData.store?.email}</span>
                  </div>
                  <div className="owner-store-meta-item">
                    <PinIcon size={15} />
                    <span>{dashboardData.store?.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <span className="owner-store-id-tag">
              Store #{dashboardData.store?.id}
            </span>
          </section>

          {/* 2. Rating Summary Grid */}
          <section aria-label="Store Rating Summary">
            <div className="owner-metrics-grid">
              {/* Average Rating Card */}
              <article className="owner-metric-card">
                <div>
                  <div className="owner-metric-header">
                    <span className="owner-metric-title">Average Rating</span>
                    <StarIcon size={16} filled style={{ color: "var(--color-rating)" }} />
                  </div>

                  <div className="owner-metric-score-wrap">
                    {totalRatingsNum > 0 ? (
                      <>
                        <span className="owner-metric-big-score">{avgRatingNum.toFixed(1)}</span>
                        <span className="owner-metric-scale">/ 5.0</span>
                      </>
                    ) : (
                      <span className="owner-metric-big-score" style={{ fontSize: "22px", color: "var(--color-text-muted)" }}>
                        No ratings yet
                      </span>
                    )}
                  </div>

                  {totalRatingsNum > 0 && renderStars(avgRatingNum)}

                  <p className="owner-metric-subtext">
                    {totalRatingsNum > 0
                      ? "Calculated from all verified customer reviews submitted to date."
                      : "Awaiting first customer feedback in the directory."}
                  </p>
                </div>
              </article>

              {/* Total Ratings Card */}
              <article className="owner-metric-card">
                <div>
                  <div className="owner-metric-header">
                    <span className="owner-metric-title">Total Ratings</span>
                    <UserIcon size={16} style={{ color: "var(--color-text-muted)" }} />
                  </div>

                  <div className="owner-metric-score-wrap">
                    <span className="owner-metric-big-score">{totalRatingsNum}</span>
                    <span className="owner-metric-scale">
                      {totalRatingsNum === 1 ? "rating" : "ratings"}
                    </span>
                  </div>

                  <p className="owner-metric-subtext" style={{ marginTop: "16px" }}>
                    Total number of customers who have shared their rating experience.
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* 3. Customer Feedback Table */}
          <section className="owner-feedback-section" aria-label="Customer Feedback">
            <div className="owner-section-header">
              <h2 className="owner-section-title">Customer Feedback</h2>
              <span className="owner-count-badge">
                {dashboardData.ratings?.length || 0} review
                {dashboardData.ratings?.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Empty State when no ratings exist */}
            {!dashboardData.ratings || dashboardData.ratings.length === 0 ? (
              <div className="owner-empty-state-card">
                <div className="owner-empty-icon-wrap">
                  <StarIcon size={24} filled />
                </div>
                <h3 className="owner-empty-title">No customer ratings yet</h3>
                <p className="owner-empty-desc">
                  When customers rate your store in the community directory, their ratings and review
                  timestamps will appear right here in real time.
                </p>
              </div>
            ) : (
              /* Populated Feedback Table */
              <div className="admin-table-wrapper">
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email Address</th>
                        <th>Submitted Rating</th>
                        <th style={{ textAlign: "right" }}>Review Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ratings.map((rating) => (
                        <tr key={rating.user_id}>
                          <td>
                            <div className="table-user-cell">
                              <div
                                className="table-user-monogram"
                                style={{ background: "var(--role-user-bg)", color: "var(--role-user-color)", borderColor: "var(--role-user-border)" }}
                                aria-hidden="true"
                              >
                                {rating.user_name ? rating.user_name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <span className="table-user-name">{rating.user_name}</span>
                            </div>
                          </td>
                          <td>{rating.user_email}</td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "var(--color-rating)",
                                background: "var(--color-rating-subtle)",
                                border: "1px solid var(--color-rating-border)",
                                padding: "3px 9px",
                                borderRadius: "4px",
                              }}
                            >
                              <StarIcon size={14} filled />
                              <span>{rating.rating} / 5</span>
                            </span>
                          </td>
                          <td style={{ textAlign: "right", color: "var(--color-text-secondary)" }}>
                            {formatDate(rating.updated_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default OwnerDashboard;
