import { useEffect, useState } from "react";
import api from "../services/api";

function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOwnerDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/owner/dashboard");
        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Unable to load store owner dashboard:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load store owner dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDashboard();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">STORE OWNER DASHBOARD</p>

        <h1>
          Store <em>Dashboard</em>
        </h1>

        <p className="dashboard-subtitle">
          Monitor your store details, rating metrics, and customer feedback.
        </p>

        {error && <p className="form-error">{error}</p>}

        {loading && (
          <p className="dashboard-subtitle">Loading dashboard details...</p>
        )}

        {!loading && dashboardData && (
          <>
            {/* Store Information */}
            <div className="owner-store-card">
              <div className="owner-store-info">
                <span className="owner-label">STORE INFORMATION</span>
                <h2>{dashboardData.store?.name}</h2>
                <div className="owner-meta-row">
                  <div>
                    <span className="meta-label">Email</span>
                    <strong>{dashboardData.store?.email}</strong>
                  </div>
                  <div>
                    <span className="meta-label">Address</span>
                    <strong>{dashboardData.store?.address}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="stats-grid owner-stats-grid">
              <div className="stat-card">
                <span>Average Rating</span>
                <strong>
                  {Number(dashboardData.averageRating || 0).toFixed(1)}{" "}
                  <small className="stat-scale">/ 5</small>
                </strong>
              </div>

              <div className="stat-card">
                <span>Total Ratings</span>
                <strong>{dashboardData.totalRatings || 0}</strong>
              </div>
            </div>

            {/* Ratings Section */}
            <div className="owner-ratings-section">
              <div className="section-header">
                <h2>Customer Ratings</h2>
                <span className="ratings-count-badge">
                  {dashboardData.ratings?.length || 0} review
                  {dashboardData.ratings?.length === 1 ? "" : "s"}
                </span>
              </div>

              {(!dashboardData.ratings || dashboardData.ratings.length === 0) ? (
                <div className="empty-ratings-card">
                  <p>No ratings submitted yet for your store.</p>
                </div>
              ) : (
                <div className="stores-table-wrapper">
                  <table className="stores-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>User Email</th>
                        <th>Rating</th>
                        <th>Updated Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.ratings.map((rating) => (
                        <tr key={rating.user_id}>
                          <td>{rating.user_name}</td>
                          <td>{rating.user_email}</td>
                          <td>
                            <strong>{rating.rating} / 5</strong>
                          </td>
                          <td>{formatDate(rating.updated_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default OwnerDashboard;
