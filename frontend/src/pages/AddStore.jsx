import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  StoreIcon,
  MailIcon,
  SpinnerIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../components/Icons";

function AddStore() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(true);

  const fetchOwners = useCallback(async () => {
    try {
      setLoadingOwners(true);
      const response = await api.get("/admin/users");
      const storeOwners = (response.data?.data || []).filter(
        (user) => user.role === "STORE_OWNER"
      );
      setOwners(storeOwners);
    } catch (err) {
      console.error("Unable to load store owners:", err);
      setError(
        err.response?.data?.message || "Unable to fetch store owners list."
      );
    } finally {
      setLoadingOwners(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (!isCancelled) {
        fetchOwners();
      }
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [fetchOwners]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const validate = () => {
    const { name, email, address, owner_id } = formData;

    if (!name.trim() || !email.trim() || !address.trim() || !owner_id) {
      return "All fields including the assigned Store Owner are required.";
    }

    if (name.trim().length < 20 || name.trim().length > 60) {
      return "Store name must be between 20 and 60 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid store email address.";
    }

    if (address.trim().length > 400) {
      return "Store address must not exceed 400 characters.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/admin/stores", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        ownerId: Number(formData.owner_id),
      });

      setSuccess(`Store "${formData.name.trim()}" registered successfully!`);

      setFormData({
        name: "",
        email: "",
        address: "",
        owner_id: "",
      });
    } catch (err) {
      console.error("Create store error:", err);
      setError(
        err.response?.data?.message || "Failed to register store. Please check input parameters."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-console-layout">
      {/* Header */}
      <header className="admin-header-flex">
        <div className="admin-header-main">
          <span className="admin-eyebrow">
            <StoreIcon size={14} />
            MERCHANT ENROLLMENT
          </span>
          <h1 className="admin-main-title">Register New Store</h1>
          <p className="admin-subtitle">
            Configure a new physical storefront location and assign administrative ownership to an
            authorized Store Owner.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/stores" className="admin-btn-secondary">
            ← Back to Store Directory
          </Link>
        </div>
      </header>

      {/* Form Container */}
      <div className="admin-form-container">
        <div className="admin-form-card">
          {error && (
            <div className="auth-alert alert-error" role="alert" style={{ marginBottom: "20px" }}>
              <AlertCircleIcon size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert alert-success" role="status" style={{ marginBottom: "20px" }}>
              <CheckCircleIcon size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Store Name */}
            <div className="admin-form-group">
              <label htmlFor="store-name">Store Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <StoreIcon size={18} />
                </span>
                <input
                  id="store-name"
                  name="name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Blue Ridge Artisan Mercantile"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="form-hint">Must be 20 to 60 characters.</p>
            </div>

            {/* Store Email */}
            <div className="admin-form-group">
              <label htmlFor="store-email">Business Contact Email</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <MailIcon size={18} />
                </span>
                <input
                  id="store-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="e.g. contact@blueridgemercantile.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Physical Address */}
            <div className="admin-form-group">
              <label htmlFor="store-address">Store Location / Address</label>
              <div style={{ position: "relative" }}>
                <textarea
                  id="store-address"
                  name="address"
                  rows={3}
                  className="admin-textarea-control"
                  placeholder="Enter complete store physical street address, suite, city, and state"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="form-hint">Maximum 400 characters.</p>
            </div>

            {/* Store Owner Selection */}
            <div className="admin-form-group">
              <label htmlFor="store-owner">Designated Store Owner</label>
              {loadingOwners ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0" }}>
                  <SpinnerIcon size={16} />
                  <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                    Loading eligible store owners...
                  </span>
                </div>
              ) : owners.length === 0 ? (
                <div
                  className="auth-alert alert-warning"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    color: "#92400e",
                  }}
                >
                  <AlertCircleIcon size={16} />
                  <span>
                    No Store Owner accounts found. Please{" "}
                    <Link
                      to="/admin/users/add"
                      style={{ textDecoration: "underline", fontWeight: "600" }}
                    >
                      create a Store Owner account
                    </Link>{" "}
                    first.
                  </span>
                </div>
              ) : (
                <select
                  id="store-owner"
                  name="owner_id"
                  className="filter-select"
                  style={{ width: "100%", height: "42px" }}
                  value={formData.owner_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Select an Authorized Store Owner —</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Form Actions */}
            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn-primary"
                style={{ height: "42px", padding: "0 24px" }}
                disabled={loading || owners.length === 0}
              >
                {loading ? (
                  <>
                    <SpinnerIcon size={16} />
                    <span>Registering Store...</span>
                  </>
                ) : (
                  <span>Register Store</span>
                )}
              </button>

              <button
                type="button"
                className="admin-btn-secondary"
                style={{ height: "42px" }}
                onClick={() => navigate("/admin/stores")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AddStore;