import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StoreIcon, LogoutIcon } from "../components/Icons";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getHomePath = () => {
    if (user?.role === "ADMIN") return "/admin";
    if (user?.role === "STORE_OWNER") return "/owner";
    if (user?.role === "USER") return "/stores";
    return "/login";
  };

  const formatRole = (role) => {
    if (role === "ADMIN") return "Admin";
    if (role === "STORE_OWNER") return "Store Owner";
    if (role === "USER") return "User";
    return role || "";
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <div className="navbar-brand-section">
          <Link to={getHomePath()} className="navbar-brand" aria-label="Roxiler Store Ratings Home">
            <span className="brand-badge">
              <StoreIcon size={14} style={{ marginRight: "3px" }} />
              ROXILER
            </span>
            <span className="brand-title">Store Ratings</span>
          </Link>
        </div>

        <nav className="navbar-links" aria-label="Main Navigation">
          {user?.role === "ADMIN" && (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Users
              </NavLink>
              <NavLink
                to="/admin/stores"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Stores
              </NavLink>
            </>
          )}

          {user?.role === "USER" && (
            <NavLink
              to="/stores"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Stores
            </NavLink>
          )}

          {user?.role === "STORE_OWNER" && (
            <NavLink
              to="/owner"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>
          )}

          <NavLink
            to="/change-password"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Change Password
          </NavLink>
        </nav>

        <div className="navbar-user-section">
          {user && (
            <div className="user-profile">
              <span className="user-name">{user.name}</span>
              <span className={`user-role-badge role-${user.role?.toLowerCase().replace(/_/g, '-')}`}>
                {formatRole(user.role)}
              </span>
            </div>
          )}

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            aria-label="Log out of application"
          >
            <LogoutIcon size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
