import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import RoleRoute from "./components/RoleRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminStores from "./pages/AdminStores";
import AddUser from "./pages/AddUser";
import AddStore from "./pages/AddStore";
import Stores from "./pages/Stores";
import OwnerDashboard from "./pages/OwnerDashboard";
import ChangePassword from "./pages/ChangePassword";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AuthenticatedLayout />}>
            {/* ADMIN ROUTES */}
            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/stores" element={<AdminStores />} />
              <Route path="/admin/users/add" element={<AddUser />} />
              <Route path="/admin/stores/add" element={<AddStore />} />
            </Route>

            {/* USER ROUTES */}
            <Route element={<RoleRoute allowedRoles={["USER"]} />}>
              <Route path="/stores" element={<Stores />} />
            </Route>

            {/* STORE OWNER ROUTES */}
            <Route element={<RoleRoute allowedRoles={["STORE_OWNER"]} />}>
              <Route path="/owner" element={<OwnerDashboard />} />
            </Route>

            {/* ACCESSIBLE TO ALL AUTHENTICATED ROLES */}
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;