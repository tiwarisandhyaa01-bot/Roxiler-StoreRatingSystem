import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getDefaultPathForRole = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "STORE_OWNER":
      return "/owner";
    case "USER":
      return "/stores";
    default:
      return "/login";
  }
};

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallbackPath = getDefaultPathForRole(user.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? children : <Outlet />;
}

export default RoleRoute;
