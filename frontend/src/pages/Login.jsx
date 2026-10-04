import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">ROXILER SYSTEMS</p>

        <h1>
          Welcome <em>back.</em>
        </h1>

        <p className="login-subtitle">
          Sign in to manage stores, users, and ratings.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {successMessage && <p className="form-success">{successMessage}</p>}
          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="auth-footer-text">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;