import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) navigate(`/${user.role}/dashboard`, { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      const userData = await login({ email, password });
      navigate(`/${userData.role}/dashboard`);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="brand-logo">
          <img src={logo} alt="EcoLog Solutions" className="brand-logo-img" />
          <div>
            <div className="brand-name">EcoLog</div>
            <div className="brand-tagline">Solutions</div>
          </div>
        </div>
        <div className="auth-hero">
          <h1>
            Logistique <span>Responsable</span>
          </h1>
          <p>Plateforme unifiée de suivi carbone, transport vert et pilotage ESG pour les entreprises engagées.</p>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-title">Bienvenue</div>
          <div className="auth-card-sub">{t("auth.accessSpace")}</div>
          
          <div className="field-group">
            <label className="field-label">Email</label>
            <input 
              className="field-input" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="nom@entreprise.fr" 
              required
            />
          </div>
          
          <div className="field-group">
            <label className="field-label">Mot de passe</label>
            <input 
              className="field-input" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required
            />
          </div>
          
          <button className="btn-auth" type="submit">
            {t("auth.login")} →
          </button>
          
          <div className="auth-switch">
            {t("auth.noAccount")} <Link className="auth-link" to="/signup">{t("auth.signup")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
