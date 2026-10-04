import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

function AuthenticatedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="authenticated-layout">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default AuthenticatedLayout;
