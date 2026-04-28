import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import ShipperDashboard from "./pages/shipper/Dashboard";
import CarrierDashboard from "./pages/carrier/Dashboard";
import ClientDashboard from "./pages/client/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import { RoleTablePage, RoleProfilePage, RoleReportPage } from "./pages/shared/RolePages";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? `/${user.role}/dashboard` : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute role="shipper" />}>
        <Route path="/shipper" element={<AppLayout role="shipper" />}>
          <Route path="dashboard" element={<ShipperDashboard />} />
          <Route path="shipments" element={<RoleTablePage role="shipper" pageKey="shipments" />} />
          <Route path="tracking" element={<RoleTablePage role="shipper" pageKey="tracking" />} />
          <Route path="carbon" element={<RoleReportPage role="shipper" pageKey="carbon" />} />
          <Route path="marketplace" element={<RoleTablePage role="shipper" pageKey="marketplace" />} />
          <Route path="esg" element={<RoleReportPage role="shipper" pageKey="esg" />} />
          <Route path="notifications" element={<RoleTablePage role="shipper" pageKey="notifications" />} />
          <Route path="profile" element={<RoleProfilePage role="shipper" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="carrier" />}>
        <Route path="/carrier" element={<AppLayout role="carrier" />}>
          <Route path="dashboard" element={<CarrierDashboard />} />
          <Route path="missions" element={<RoleTablePage role="carrier" pageKey="missions" />} />
          <Route path="fleet" element={<RoleTablePage role="carrier" pageKey="fleet" />} />
          <Route path="certifications" element={<RoleTablePage role="carrier" pageKey="certifications" />} />
          <Route path="notifications" element={<RoleTablePage role="carrier" pageKey="notifications" />} />
          <Route path="profile" element={<RoleProfilePage role="carrier" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="client" />}>
        <Route path="/client" element={<AppLayout role="client" />}>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="orders" element={<RoleTablePage role="client" pageKey="orders" />} />
          <Route path="impact" element={<RoleReportPage role="client" pageKey="impact" />} />
          <Route path="documents" element={<RoleTablePage role="client" pageKey="documents" />} />
          <Route path="notifications" element={<RoleTablePage role="client" pageKey="notifications" />} />
          <Route path="profile" element={<RoleProfilePage role="client" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AppLayout role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<RoleTablePage role="admin" pageKey="users" />} />
          <Route path="carriers" element={<RoleTablePage role="admin" pageKey="carriers" />} />
          <Route path="carbon-ref" element={<RoleTablePage role="admin" pageKey="carbonRef" />} />
          <Route path="logs" element={<RoleTablePage role="admin" pageKey="logs" />} />
          <Route path="marketplace" element={<RoleTablePage role="admin" pageKey="marketplace" />} />
          <Route path="reports" element={<RoleReportPage role="admin" pageKey="reports" />} />
          <Route path="profile" element={<RoleProfilePage role="admin" />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
