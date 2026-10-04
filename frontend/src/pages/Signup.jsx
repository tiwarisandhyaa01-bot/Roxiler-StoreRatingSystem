import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { UserIcon, MailIcon, PinIcon, LockIcon, EyeIcon, EyeOffIcon, StoreIcon, SpinnerIcon, AlertCircleIcon, CheckCircleIcon } from "../components/Icons";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Dynamic Password Validation Criteria
  const passwordLengthMet = formData.password.length >= 8 && formData.password.length <= 16;
  const passwordUppercaseMet = /[A-Z]/.test(formData.password);
  const passwordSpecialCharMet = /[^A-Za-z0-9]/.test(formData.password);

  const validate = () => {
    const { name, email, address, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !address.trim() || !password || !confirmPassword) {
      return "All fields are required.";
    }

    if (name.trim().length < 20 || name.trim().length > 60) {
      return "Name must be between 20 and 60 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please provide a valid email address.";
    }

    if (address.trim().length > 400) {
      return "Address must not exceed 400 characters.";
    }

    if (password.length < 8 || password.length > 16) {
      return "Password must be 8–16 characters long.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
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
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });

      setSuccess("Account created successfully! Redirecting to sign in...");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              response.data?.message ||
              "Registration successful! You can now log in with your credentials.",
          },
        });
      }, 1200);
    } catch (err) {
      console.error("Signup error occurred:", err);
      setError(
        err.response?.data?.message ||
          "Unable to complete registration. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormIncomplete =
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.address.trim() ||
    !formData.password ||
    !formData.confirmPassword;

  return (
    <div className="auth-container-centered">
      {/* Brand & Purpose Header */}
      <div className="auth-brand-area">
        <div className="auth-brand-header-row">
          <div className="auth-brand-logo" aria-hidden="true">
            <StoreIcon size={20} />
          </div>
          <span className="auth-brand-name">Roxiler</span>
          <span className="auth-brand-env-badge">Community Portal</span>
        </div>
        <p className="auth-product-statement">
          Join the verified community to explore neighborhood stores, compare real reviews, and submit ratings.
        </p>
      </div>

      {/* Main Signup Card */}
      <div className="auth-card-panel signup-panel">
        <div className="auth-card-header">
          <h1 className="auth-card-title">Create your account</h1>
          <p className="auth-card-subtitle">
            Register as a normal user to contribute verified store evaluations.
          </p>
        </div>

        {/* Inline Alerts */}
        {error && (
          <div className="alert-error" role="alert" aria-live="assertive">
            <AlertCircleIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-success" role="status" aria-live="polite">
            <CheckCircleIcon size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body">
          {/* Group 1: Personal Identification */}
          <div className="auth-form-section">
            <span className="auth-section-title">Personal Details</span>

            <div className="auth-row-2col">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-name" className="form-label">
                  <span>Full Name</span>
                  <span className="form-label-hint">20–60 chars</span>
                </label>
                <div className="input-container with-lead-icon">
                  <UserIcon className="input-icon-lead" size={16} />
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-email" className="form-label">
                  Email Address
                </label>
                <div className="input-container with-lead-icon">
                  <MailIcon className="input-icon-lead" size={16} />
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Location */}
          <div className="auth-form-section">
            <span className="auth-section-title">Residential Location</span>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="signup-address" className="form-label">
                <span>Address</span>
                <span className="form-label-hint">Max 400 chars</span>
              </label>
              <div className="input-container with-lead-icon">
                <PinIcon className="input-icon-lead" size={16} style={{ alignSelf: "flex-start", marginTop: "11px" }} />
                <textarea
                  id="signup-address"
                  name="address"
                  className="form-textarea"
                  style={{ paddingLeft: "38px" }}
                  placeholder="Enter your residential address (street, city, state)"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  autoComplete="street-address"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Group 3: Security & Credentials */}
          <div className="auth-form-section">
            <span className="auth-section-title">Security Credentials</span>

            <div className="auth-row-2col">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-password" className="form-label">
                  Password
                </label>
                <div className="input-container with-lead-icon with-action-icon">
                  <LockIcon className="input-icon-lead" size={16} />
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-icon-action"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="signup-confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="input-container with-lead-icon with-action-icon">
                  <LockIcon className="input-icon-lead" size={16} />
                  <input
                    id="signup-confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-icon-action"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                  >
                    {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Compact Live Requirements Checklist */}
            <div className="password-checklist-grid" aria-live="polite">
              <div className={`checklist-chip ${passwordLengthMet ? "is-met" : ""}`}>
                {passwordLengthMet ? (
                  <CheckCircleIcon size={13} className="checklist-icon" />
                ) : (
                  <span className="checklist-icon">&bull;</span>
                )}
                <span>8–16 characters</span>
              </div>

              <div className={`checklist-chip ${passwordUppercaseMet ? "is-met" : ""}`}>
                {passwordUppercaseMet ? (
                  <CheckCircleIcon size={13} className="checklist-icon" />
                ) : (
                  <span className="checklist-icon">&bull;</span>
                )}
                <span>1 uppercase letter</span>
              </div>

              <div className={`checklist-chip ${passwordSpecialCharMet ? "is-met" : ""}`}>
                {passwordSpecialCharMet ? (
                  <CheckCircleIcon size={13} className="checklist-icon" />
                ) : (
                  <span className="checklist-icon">&bull;</span>
                )}
                <span>1 special symbol</span>
              </div>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading || isFormIncomplete}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <SpinnerIcon size={16} />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Secondary Action */}
          <p className="auth-redirect-prompt">
            Already have a Roxiler account?{" "}
            <Link to="/login" className="auth-inline-link">
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <div className="auth-footer-note">
        &copy; {new Date().getFullYear()} Roxiler Systems &bull; Secure Customer Registration
      </div>
    </div>
  );
}

export default Signup;
