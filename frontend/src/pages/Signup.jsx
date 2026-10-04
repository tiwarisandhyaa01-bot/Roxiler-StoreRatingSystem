import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

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

      // Redirect to login with success message
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
      console.error("Signup error occurred");
      setError(
        err.response?.data?.message ||
          "Unable to complete registration. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card signup-card">
        <p className="eyebrow">ROXILER SYSTEMS</p>

        <h1>
          Create an <em>account.</em>
        </h1>

        <p className="login-subtitle">
          Sign up as a normal user to explore stores and submit ratings.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name (20-60 characters)"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
          />
          <span className="field-hint">Must be between 20 and 60 characters.</span>

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            placeholder="Enter your residential address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            autoComplete="street-address"
          />
          <span className="field-hint">Maximum 400 characters.</span>

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password (8-16 chars, 1 uppercase, 1 special)"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <span className="field-hint">
            Must be 8–16 characters with at least 1 uppercase letter and 1 special character.
          </span>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Signup;
