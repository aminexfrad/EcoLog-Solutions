import { NavLink } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { useTranslation } from "react-i18next";

export default function Sidebar({ role, subtitle, items, user, onLogout }) {
  const { t } = useTranslation();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="EcoLog Solutions" className="sb-logo" />
        <div>
          <div className="sb-brand-text">EcoLog Solutions</div>
          <div className="sb-brand-sub">{subtitle}</div>
        </div>
      </div>
      <nav className="nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-ic">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card-sb">
          <div className={`avatar-sb ${role === "admin" ? "av-gold" : role === "client" ? "av-purple" : "av-green"}`}>
            {user.initials}
          </div>
          <div>
            <div className="user-sb-name">{user.name}</div>
            <div className="user-sb-role">{user.label}</div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            {t("common.logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
