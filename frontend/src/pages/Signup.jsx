import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleConfig } from "../data/mockData";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "shipper" });
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) navigate(`/${user.role}/dashboard`, { replace: true });
  }, [user, navigate]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    signup({ ...form, name: form.name || roleConfig[form.role].demoUser.name });
    navigate(`/${form.role}/dashboard`);
  };
  return (
    <div className="auth-screen active">
      <div className="auth-bg" />
      <div className="auth-pattern" />
      <div className="auth-right" style={{ marginLeft: "auto" }}>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-card-title">Creer un compte</div>
          <div className="field-group">
            <label className="field-label">Nom complet</label>
            <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Role</label>
            <select className="field-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="shipper">Expediteur</option>
              <option value="carrier">Transporteur</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Mot de passe</label>
            <input className="field-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn-auth" type="submit">
            Creer mon compte →
          </button>
          <div className="auth-switch">
            Deja inscrit ? <Link className="auth-link" to="/login">Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
