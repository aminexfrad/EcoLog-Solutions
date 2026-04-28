import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { roleConfig } from "../data/mockData";

const titleBySlug = {
  dashboard: "Dashboard",
  shipments: "Expeditions",
  tracking: "Suivi GPS",
  carbon: "Bilan carbone",
  marketplace: "Marketplace CO2",
  esg: "Rapport ESG",
  notifications: "Notifications",
  profile: "Profil",
  missions: "Missions",
  fleet: "Flotte",
  certifications: "Certifications",
  orders: "Commandes",
  impact: "Impact carbone",
  documents: "Documents",
  users: "Utilisateurs",
  carriers: "Transporteurs",
  "carbon-ref": "Referentiel CO2",
  logs: "Audit logs",
  reports: "Rapports ESG",
};

export default function AppLayout({ role, onPrimaryClick }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const meta = roleConfig[role];
  const currentSlug = location.pathname.split("/").pop();
  const title = titleBySlug[currentSlug] || meta.defaultTitle;
  const sidebarUser = user?.name
    ? { name: user.name, initials: user.name.slice(0, 2).toUpperCase(), label: meta.subtitle }
    : meta.demoUser;

  return (
    <div className="app-layout">
      <Sidebar
        role={role}
        subtitle={meta.subtitle}
        items={meta.navItems}
        user={sidebarUser}
        onLogout={() => {
          logout();
          navigate("/login");
        }}
      />
      <main className="main-content">
        <Topbar
          title={title}
          onPrimaryClick={onPrimaryClick}
          primaryLabel={onPrimaryClick ? "Action" : null}
          score={meta.score}
          onLogout={() => {
            logout();
            navigate("/login");
          }}
        />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
