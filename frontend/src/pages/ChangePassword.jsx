import { useState } from "react";
import api from "../services/api";

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      return "Password must be 8–16 characters long.";
    }

    if (!/[A-Z]/.test(newPassword)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return "Password must contain at least one special character.";
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

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">ACCOUNT SETTINGS</p>

        <h1>
          Change <em>Password</em>
        </h1>

        <p className="dashboard-subtitle">
          Update your account password with a strong and secure combination.
        </p>

        <div className="change-password-card">
          <form onSubmit={handleSubmit} className="change-password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password (8-16 chars, 1 uppercase, 1 special char)"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <span className="field-hint">
                Must be 8–16 characters, including at least one uppercase letter and one special character.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <div className="form-actions">
              <button type="submit" disabled={loading} className="primary-button">
                {loading ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default ChangePassword;
