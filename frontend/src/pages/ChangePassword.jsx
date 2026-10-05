import { useState } from "react";
import api from "../services/api";
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SpinnerIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../components/Icons";

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return "All fields are required.";
    }

    if (newPassword !== confirmPassword) {
      return "New password and confirmation do not match.";
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      return "New password must be 8–16 characters long.";
    }

    if (!/[A-Z]/.test(newPassword)) {
      return "New password must contain at least one uppercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return "New password must contain at least one special character.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.put("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(
        response.data?.message || "Password updated successfully."
      );
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update password. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passLength = formData.newPassword.length >= 8 && formData.newPassword.length <= 16;
  const passUpper = /[A-Z]/.test(formData.newPassword);
  const passSpecial = /[^A-Za-z0-9]/.test(formData.newPassword);

  return (
    <main className="admin-console-layout">
      {/* Header */}
      <header className="admin-header-flex" style={{ marginBottom: "24px" }}>
        <div className="admin-header-main">
          <span className="admin-eyebrow">
            <LockIcon size={14} />
            SECURITY & ACCESS CREDENTIALS
          </span>
          <h1 className="admin-main-title">Change Password</h1>
          <p className="admin-subtitle">
            Update your account password with a strong combination meeting security requirements.
          </p>
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
            {/* Current Password */}
            <div className="admin-form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                >
                  {showCurrentPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="admin-form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
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

            {/* Confirm New Password */}
            <div className="admin-form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <LockIcon size={18} />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn-primary"
                style={{ height: "42px", padding: "0 24px" }}
                disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              >
                {loading ? (
                  <>
                    <SpinnerIcon size={16} />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ChangePassword;
