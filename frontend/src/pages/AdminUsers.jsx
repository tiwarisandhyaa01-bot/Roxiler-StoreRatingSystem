import { useEffect, useState } from "react";
import api from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
  name: "",
  email: "",
  address: "",
  role: "",
});

const [sortBy, setSortBy] = useState("name");
const [order, setOrder] = useState("asc");

const handleFilterChange = (event) => {
  setFilters({
    ...filters,
    [event.target.name]: event.target.value,
  });
};

const handleViewUser = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    console.log("User details:", response.data.data);
    setSelectedUser(response.data.data);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Unable to load user details."
    );
  }
};

const filteredUsers = users.filter((user) => {
  const matchesName = user.name
    .toLowerCase()
    .includes(filters.name.toLowerCase());

  const matchesEmail = user.email
    .toLowerCase()
    .includes(filters.email.toLowerCase());

  const matchesAddress = user.address
    .toLowerCase()
    .includes(filters.address.toLowerCase());

  const matchesRole =
    !filters.role || user.role === filters.role;

  return (
    matchesName &&
    matchesEmail &&
    matchesAddress &&
    matchesRole
  );
});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users", {
  params: {
    sortBy,
    order,
  },
});
        setUsers(response.data.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load users."
        );
      }
    };

    fetchUsers();
  }, [sortBy, order]);

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">
        <p className="eyebrow">USER MANAGEMENT</p>

        <h1>
          All <em>Users</em>
        </h1>

        <p className="dashboard-subtitle">
          View and manage registered users across the platform.
        </p>

        {error && <p className="form-error">{error}</p>}

<div className="users-filters">
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
    name="role"
    value={filters.role}
    onChange={handleFilterChange}
  >
    <option value="">All Roles</option>
    <option value="ADMIN">Admin</option>
    <option value="USER">User</option>
    <option value="STORE_OWNER">Store Owner</option>
  </select>

  <select
  value={sortBy}
  onChange={(event) => setSortBy(event.target.value)}
>
  <option value="name">Sort by Name</option>
  <option value="email">Sort by Email</option>
  <option value="address">Sort by Address</option>
  <option value="role">Sort by Role</option>
</select>

<select
  value={order}
  onChange={(event) => setOrder(event.target.value)}
>
  <option value="asc">Ascending ↑</option>
  <option value="desc">Descending ↓</option>
</select>
</div>

{selectedUser && (
  <div className="user-details-card">
    <div className="user-details-header">
      <div>
        <p className="eyebrow">USER DETAILS</p>
        <h2>{selectedUser.name}</h2>
      </div>

      <button
        type="button"
        className="close-details-button"
        onClick={() => setSelectedUser(null)}
      >
        Close
      </button>
    </div>

    <div className="user-details-grid">
      <div>
        <span>Email</span>
        <strong>{selectedUser.email}</strong>
      </div>

      <div>
        <span>Role</span>
        <strong>{selectedUser.role}</strong>
      </div>

      <div>
        <span>Address</span>
        <strong>{selectedUser.address}</strong>
      </div>

      {selectedUser.role === "STORE_OWNER" && (
  <div>
    <span>Rating</span>
    <strong>
      {selectedUser.rating ?? "No ratings yet"}
    </strong>
  </div>
)} 

    </div>
  </div>
)}

{filteredUsers.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address}</td>
                    <td>{user.role}</td>
                    <td>
                    <button
                    type="button"
                    className="view-user-button"
                    onClick={() => handleViewUser(user.id)}
                    >
                    View
                    </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminUsers;