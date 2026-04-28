import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "shipper" });
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) navigate(`/${user.role}/dashboard`, { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    try {
      const userData = await signup({ ...form });
      navigate(`/${userData.role}/dashboard`);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur d'inscription");
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
            Rejoignez <br/><span>l'Avenir Vert</span>
          </h1>
          <p>La solution N°1 pour optimiser votre flotte, décarboner vos livraisons et piloter votre RSE en temps réel.</p>
        </div>
      </div>

      <div className="auth-right">
        <form className="auth-card fade-in" onSubmit={submit}>
          <div className="auth-card-title">Créer un compte</div>
          <div className="auth-card-sub">Renseignez vos informations.</div>
          
          <div className="field-group">
            <label className="field-label">Nom complet</label>
            <input 
              className="field-input" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="Ex: Jean Dupont"
              required
            />
          </div>
          
          <div className="field-group">
            <label className="field-label">Email</label>
            <input 
              className="field-input" 
              type="email"
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder="nom@entreprise.fr"
              required
            />
          </div>
          
          <div className="field-group">
            <label className="field-label">Type de profil</label>
            <select 
              className="field-input" 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="shipper">Expéditeur</option>
              <option value="carrier">Transporteur</option>
              <option value="client">Client final</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <div className="field-group">
            <label className="field-label">Mot de passe</label>
            <input 
              className="field-input" 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              placeholder="••••••••"
              required
            />
          </div>
          
          <button className="btn-auth" type="submit">
            S'inscrire →
          </button>
          
          <div className="auth-switch">
            Déjà inscrit ? <Link className="auth-link" to="/login">Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
