import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/stores" element={<AdminStores />} />
          <Route path="/admin/users/add" element={<AddUser />} />
          <Route path="/admin/stores/add" element={<AddStore />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;