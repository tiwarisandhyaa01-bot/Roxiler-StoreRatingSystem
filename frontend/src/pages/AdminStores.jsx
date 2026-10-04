import { useEffect, useState } from "react";
import api from "../services/api";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setError("");

        const response = await api.get("/admin/stores", {
          params: {
            sortBy,
            order,
          },
        });

        setStores(response.data.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load stores."
        );
      }
    };

    fetchStores();
  }, [sortBy, order]);

  const filteredStores = stores.filter((store) => {
    return (
      store.name
        .toLowerCase()
        .includes(filters.name.toLowerCase()) &&
      store.email
        .toLowerCase()
        .includes(filters.email.toLowerCase()) &&
      store.address
        .toLowerCase()
        .includes(filters.address.toLowerCase())
    );
  });

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">STORE MANAGEMENT</p>

        <h1>
          All <em>Stores</em>
        </h1>

        <p className="dashboard-subtitle">
          View registered stores and their current ratings.
        </p>

        {error && <p className="form-error">{error}</p>}

        <div className="stores-filters">
          <input
            type="text"
            name="name"
            placeholder="Search by name"
            value={filters.name}
            onChange={handleFilterChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Search by email"
            value={filters.email}
            onChange={handleFilterChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Search by address"
            value={filters.address}
            onChange={handleFilterChange}
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="address">Sort by Address</option>
            <option value="average_rating">Sort by Rating</option>
          </select>

          <select
            value={order}
            onChange={(event) => setOrder(event.target.value)}
          >
            <option value="asc">Ascending ↑</option>
            <option value="desc">Descending ↓</option>
          </select>
        </div>

        {filteredStores.length > 0 && (
          <div className="stores-table-wrapper">
            <table className="stores-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Rating</th>
                </tr>
              </thead>

              <tbody>
                {filteredStores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td>
                      {Number(store.average_rating).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {stores.length > 0 && filteredStores.length === 0 && (
          <p className="dashboard-subtitle">
            No stores match your search.
          </p>
        )}

        {stores.length === 0 && !error && (
          <p className="dashboard-subtitle">
            No stores available.
          </p>
        )}
      </section>
    </main>
  );
}

export default AdminStores;