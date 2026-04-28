import { usePlatform } from "../context/PlatformContext";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, onPrimaryClick, primaryLabel, score, onLogout }) {
  const { notifications } = usePlatform();
  const { user } = useAuth();
  const unread = notifications.filter((n) => !n.is_read).length;
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <button className="btn-icon notif-wrap">🔔 {unread > 0 ? unread : ""}</button>
        <button className="btn btn-ghost btn-sm">🌿 Score {user?.green_score || score}</button>
        {onPrimaryClick && (
          <button className="btn btn-primary" onClick={onPrimaryClick}>
            {primaryLabel}
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          ⇥ Deconnexion
        </button>
      </div>
    </div>
  );
}
