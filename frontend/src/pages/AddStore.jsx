import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await api.get("/admin/users");

        const storeOwners = response.data.data.filter(
          (user) => user.role === "STORE_OWNER"
        );

        setOwners(storeOwners);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load store owners."
        );
      }
    };

    fetchOwners();
  }, []);

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
      await api.post("/admin/stores", {
  name: formData.name,
  email: formData.email,
  address: formData.address,
  ownerId: Number(formData.owner_id),
});

      setSuccess("Store created successfully.");

      setFormData({
        name: "",
        email: "",
        address: "",
        owner_id: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create store. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">STORE MANAGEMENT</p>

        <h1>
          Add <em>Store</em>
        </h1>

        <p className="dashboard-subtitle">
          Register a new store and assign it to a Store Owner.
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Store Name</label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter store name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Store Email</label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter store email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="address">Store Address</label>

          <textarea
            id="address"
            name="address"
            placeholder="Enter store address"
            value={formData.address}
            onChange={handleChange}
            rows="4"
            required
          />

          <label htmlFor="owner_id">Store Owner</label>

          <select
            id="owner_id"
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Store Owner</option>

            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} — {owner.email}
              </option>
            ))}
          </select>

          {error && <p className="form-error">{error}</p>}

          {success && <p className="form-success">{success}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Store"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/admin/stores")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default AddStore;