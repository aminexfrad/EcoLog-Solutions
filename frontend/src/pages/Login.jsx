import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../data/mockData";
import logo from "../assets/logo.jpeg";

const roles = [
  { id: "shipper", icon: "🏭", label: "Expediteur" },
  { id: "carrier", icon: "🚛", label: "Transporteur" },
  { id: "client", icon: "🛒", label: "Client" },
  { id: "admin", icon: "🛠️", label: "Admin" },
];

export default function Login() {
  const [role, setRole] = useState("shipper");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) navigate(`/${user.role}/dashboard`, { replace: true });
  }, [user, navigate]);

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    login({ email, role, name: roleConfig[role].demoUser.name });
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="auth-screen active">
      <div className="auth-bg" />
      <div className="auth-pattern" />
      <div className="auth-left">
        <div className="brand-logo">
          <img src={logo} alt="EcoLog Solutions" className="brand-logo-img" />
          <div>
            <div className="brand-name">EcoLog Solutions</div>
            <div className="brand-tagline">EcoLog Solutions</div>
          </div>
        </div>
        <div className="auth-hero">
          <h1>
            Logistique <span>responsable</span>
          </h1>
          <p>Plateforme unifiee de suivi carbone, transport vert et pilotage ESG.</p>
        </div>
      </div>
      <div className="auth-right">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-title">Connexion</div>
          <div className="auth-card-sub">Choisissez votre profil</div>
          <div className="role-selector">
            {roles.map((r) => (
              <button key={r.id} type="button" className={`role-btn ${role === r.id ? "active" : ""}`} onClick={() => setRole(r.id)}>
                <span className="role-emoji">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.fr" />
          </div>
          <div className="field-group">
            <label className="field-label">Mot de passe</label>
            <input className="field-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          <button className="btn-auth" type="submit">
            Se connecter →
          </button>
          <div className="auth-switch">
            Pas de compte ? <Link className="auth-link" to="/signup">S'inscrire</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
