import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/admin/users", formData);

      setSuccess("User created successfully.");

      setFormData({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">USER MANAGEMENT</p>

        <h1>
          Add <em>User</em>
        </h1>

        <p className="dashboard-subtitle">
          Create a new user account and assign the appropriate role.
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="address">Address</label>

          <textarea
            id="address"
            name="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleChange}
            rows="4"
            required
          />

          <label htmlFor="role">Role</label>

          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="USER">Normal User</option>
            <option value="ADMIN">Administrator</option>
            <option value="STORE_OWNER">Store Owner</option>
         </select>

          {error && <p className="form-error">{error}</p>}

          {success && <p className="form-success">{success}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/admin/users")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default AddUser;