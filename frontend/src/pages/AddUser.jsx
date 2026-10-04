import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  UsersIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SpinnerIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../components/Icons";

function AddUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const validate = () => {
    const { name, email, password, address } = formData;

    if (!name.trim() || !email.trim() || !password || !address.trim()) {
      return "All fields are required.";
    }

    if (name.trim().length < 20 || name.trim().length > 60) {
      return "Full name must be between 20 and 60 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (address.trim().length > 400) {
      return "Address must not exceed 400 characters.";
    }

    if (password.length < 8 || password.length > 16) {
      return "Password must be 8–16 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character.";
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
      await api.post("/admin/users", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim(),
        role: formData.role,
      });

      setSuccess(`Account for "${formData.name.trim()}" created successfully with role ${formData.role}.`);

      setFormData({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });
    } catch (err) {
      console.error("User creation error:", err);
      setError(err.response?.data?.message || "Failed to create user. Please verify input data.");
    } finally {
      setLoading(false);
    }
  };

  // Password requirement live checks
  const passLength = formData.password.length >= 8 && formData.password.length <= 16;
  const passUpper = /[A-Z]/.test(formData.password);
  const passSpecial = /[^A-Za-z0-9]/.test(formData.password);

  return (
    <main className="admin-console-layout">
      {/* Header */}
      <header className="admin-header-flex">
        <div className="admin-header-main">
          <span className="admin-eyebrow">
            <UsersIcon size={14} />
            ACCESS PROVISIONING
          </span>
          <h1 className="admin-main-title">Onboard New User</h1>
          <p className="admin-subtitle">
            Create a verified user profile and assign role-based administrative, merchant, or
            consumer privileges.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/users" className="admin-btn-secondary">
            ← Back to User Directory
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
            {/* Full Name */}
            <div className="admin-form-group">
              <label htmlFor="user-name">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <UserIcon size={18} />
                </span>
                <input
                  id="user-name"
                  name="name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Eleanor Vance Montgomery"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="form-hint">Must be 20 to 60 characters.</p>
            </div>

            {/* Email Address */}
            <div className="admin-form-group">
              <label htmlFor="user-email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <MailIcon size={18} />
                </span>
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="e.g. eleanor.vance@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="admin-form-group">
              <label htmlFor="user-password">Initial Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="user-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter secure initial password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              <div className="password-checklist-grid" style={{ marginTop: "10px" }}>
                <span className={`checklist-chip ${passLength ? "met" : ""}`}>
                  <CheckCircleIcon size={13} />
                  8–16 characters
                </span>
                <span className={`checklist-chip ${passUpper ? "met" : ""}`}>
                  <CheckCircleIcon size={13} />
                  Uppercase letter
                </span>
                <span className={`checklist-chip ${passSpecial ? "met" : ""}`}>
                  <CheckCircleIcon size={13} />
                  Special symbol (!@#$)
                </span>
              </div>
            </div>

            {/* Physical Address */}
            <div className="admin-form-group">
              <label htmlFor="user-address">Physical Address</label>
              <div style={{ position: "relative" }}>
                <textarea
                  id="user-address"
                  name="address"
                  rows={3}
                  className="admin-textarea-control"
                  placeholder="Enter full street address, city, and state"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="form-hint">Maximum 400 characters.</p>
            </div>

            {/* System Role */}
            <div className="admin-form-group">
              <label htmlFor="user-role">System Role Assignment</label>
              <select
                id="user-role"
                name="role"
                className="filter-select"
                style={{ width: "100%", height: "42px" }}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="USER">Normal User (Browse, evaluate, and rate stores)</option>
                <option value="STORE_OWNER">Store Owner (Manage assigned storefront & ratings)</option>
                <option value="ADMIN">Administrator (Full operational control)</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn-primary"
                style={{ height: "42px", padding: "0 24px" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <SpinnerIcon size={16} />
                    <span>Provisioning Account...</span>
                  </>
                ) : (
                  <span>Create User Account</span>
                )}
              </button>

              <button
                type="button"
                className="admin-btn-secondary"
                style={{ height: "42px" }}
                onClick={() => navigate("/admin/users")}
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

export default AddUser;