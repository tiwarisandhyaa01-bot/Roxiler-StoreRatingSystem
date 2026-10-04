import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, StoreIcon, SpinnerIcon, AlertCircleIcon, CheckCircleIcon } from "../components/Icons";

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const successMessage = location.state?.message;

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.user.role === "ADMIN") {
      navigate("/admin");
    } else if (result.user.role === "USER") {
      navigate("/stores");
    } else if (result.user.role === "STORE_OWNER") {
      navigate("/owner");
    }
  };

  const isFormEmpty = !formData.email.trim() || !formData.password;

  return (
    <div className="auth-container-centered">
      {/* Brand & Purpose Header */}
      <div className="auth-brand-area">
        <div className="auth-brand-header-row">
          <div className="auth-brand-logo" aria-hidden="true">
            <StoreIcon size={20} />
          </div>
          <span className="auth-brand-name">Roxiler</span>
          <span className="auth-brand-env-badge">Store Ratings</span>
        </div>
        <p className="auth-product-statement">
          The verified store rating network for community feedback, store insights, and local transparency.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="auth-card-panel">
        <div className="auth-card-header">
          <h1 className="auth-card-title">Sign In</h1>
          <p className="auth-card-subtitle">
            Enter your account credentials to access the Roxiler platform.
          </p>
        </div>

        {/* Success Confirmation Alert */}
        {successMessage && (
          <div className="alert-success" role="status" aria-live="polite">
            <CheckCircleIcon size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Inline Error Alert */}
        {error && (
          <div className="alert-error" role="alert" aria-live="assertive">
            <AlertCircleIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body" noValidate={false}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <div className="input-container with-lead-icon">
              <MailIcon className="input-icon-lead" size={16} />
              <input
                id="login-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <div className="input-container with-lead-icon with-action-icon">
              <LockIcon className="input-icon-lead" size={16} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
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

          {/* Primary Action Button */}
          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading || isFormEmpty}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <SpinnerIcon size={16} />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Secondary Action */}
          <p className="auth-redirect-prompt">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-inline-link">
              Create an account
            </Link>
          </p>
        </form>
      </div>

      <div className="auth-footer-note">
        &copy; {new Date().getFullYear()} Roxiler Systems &bull; Secure Authentication Portal
      </div>
    </div>
  );
}

export default Login;