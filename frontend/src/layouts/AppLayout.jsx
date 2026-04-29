import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ChatbotWidget from "../components/ChatbotWidget";
import { roleConfig } from "../data/mockData";
import { useTranslation } from "react-i18next";

const titleBySlug = {
  dashboard: "nav.dashboard",
  shipments: "nav.shipments",
  tracking: "nav.tracking",
  carbon: "nav.carbon",
  marketplace: "nav.marketplace",
  esg: "nav.esg",
  notifications: "nav.notifications",
  profile: "nav.profile",
  missions: "nav.missions",
  fleet: "nav.fleet",
  certifications: "nav.certifications",
  orders: "nav.orders",
  impact: "nav.impact",
  documents: "nav.documents",
  users: "nav.users",
  carriers: "nav.carriers",
  "carbon-ref": "nav.carbonRef",
  logs: "nav.logs",
  reports: "nav.reports",
};

export default function AppLayout({ role, onPrimaryClick }) {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const meta = roleConfig[role];
  const currentSlug = location.pathname.split("/").pop();
  const titleKey = titleBySlug[currentSlug];
  const title = titleKey ? t(titleKey) : meta.defaultTitle;
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
          primaryLabel={onPrimaryClick ? t("common.action") : null}
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
      <ChatbotWidget role={role} />
    </div>
  );
}
