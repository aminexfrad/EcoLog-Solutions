import { usePlatform } from "../context/PlatformContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Topbar({ title, onPrimaryClick, primaryLabel, score, onLogout }) {
  const { notifications } = usePlatform();
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const unread = notifications.filter((n) => !n.is_read).length;
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <select
          className="lang-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          aria-label="Language"
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="ar">AR</option>
        </select>
        <button className="btn-icon notif-wrap">🔔 {unread > 0 ? unread : ""}</button>
        <button className="btn btn-ghost btn-sm">
          🌿 {t("common.score")} {user?.green_score || score}
        </button>
        {onPrimaryClick && (
          <button className="btn btn-primary" onClick={onPrimaryClick}>
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
