import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setStats(response.data.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard data."
        );
      }
    };

    fetchDashboard();
  }, []);

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">ADMINISTRATION</p>

        <h1>
          Admin <em>Dashboard</em>
        </h1>

        <p className="dashboard-subtitle">
          Manage users, stores, and ratings from one place.
        </p>

        {error && <p className="form-error">{error}</p>}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total Users</span>
              <strong>{stats.totalUsers}</strong>
            </div>

            <div className="stat-card">
              <span>Total Stores</span>
              <strong>{stats.totalStores}</strong>
            </div>

            <div className="stat-card">
              <span>Total Ratings</span>
              <strong>{stats.totalRatings}</strong>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;