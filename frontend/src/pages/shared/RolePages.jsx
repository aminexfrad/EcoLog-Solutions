import DataTable from "../../components/DataTable";
import { reportData, roleConfig, tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export function RoleTablePage({ role, pageKey }) {
  const {
    shipments,
    missions,
    orders,
    users,
    carrierRequests,
    tracking,
    documents,
    notifications,
    auditLogs,
    credits,
    toggleUser,
    reviewCarrierRequest,
    createShipment,
    markNotificationRead,
    markAllNotificationsRead,
    generateDocument,
    updateTracking,
  } = usePlatform();

  const [origin, setOrigin] = useState("Paris 75001");
  const [destination, setDestination] = useState("Lyon 69001");
  const [weight, setWeight] = useState("5000");
  const trackingTargets =
    role === "carrier"
      ? missions
      : role === "admin" || role === "shipper"
        ? shipments
        : orders;

  let data = tableData[pageKey];

  if (pageKey === "shipments") {
    data = { ...data, rows: shipments.map((s) => [s.reference, `${s.origin} -> ${s.destination}`, s.carrier_name || "Non assigne", s.co2_kg ? `${s.co2_kg} kg` : "-", s.status]) };
  }
  if (pageKey === "missions") {
    data = { ...data, rows: missions.map((m) => [m.reference, `${m.origin} -> ${m.destination}`, m.vehicle_type, m.status]) };
  }
  if (pageKey === "orders") {
    data = { ...data, rows: orders.map((o) => [o.reference, `${o.origin} -> ${o.destination}`, o.vehicle_type || "-", o.deadline ? new Date(o.deadline).toLocaleDateString() : "-", o.status]) };
  }
  if (pageKey === "users") {
    data = { ...data, rows: users.map((u) => [u.name, u.role, u.company || "-", u.is_active ? "Actif" : "Inactif"]) };
  }
  if (pageKey === "carriers") {
    data = { ...data, rows: carrierRequests.map((c) => [c.name, c.green_score, `${c.vehicle_count || 0} vehicules`, c.is_active ? "Valide" : "En revue"]) };
  }
  if (pageKey === "tracking") {
    data = {
      ...data,
      rows: tracking.map((t) => [t.shipment_id || "-", `${t.progress_pct}%`, new Date(t.recorded_at).toLocaleTimeString(), t.location_label || "-", "A l'instant"]),
    };
  }
  if (pageKey === "documents") {
    data = {
      ...data,
      rows: documents.map((d) => [d.id, d.reference || d.shipment_id, d.type, new Date(d.created_at).toLocaleDateString()]),
    };
  }
  if (pageKey === "notifications") {
    data = {
      ...data,
      rows: notifications.map((n) => [n.message, n.is_read ? "Lue" : "Non lue"]),
    };
  }
  if (pageKey === "logs") {
    data = {
      ...data,
      rows: auditLogs.map((l) => [new Date(l.created_at).toLocaleString(), l.action, l.details]),
    };
  }

  const roleTitle = roleConfig[role]?.defaultTitle || "Espace";
  if (!data) return <div className="card-b">Aucune donnee disponible.</div>;

  return (
    <>
      <div className="card">
        <div className="card-b">
          <div className="pg-title">{roleTitle}</div>
          <div className="pg-sub">Suivi et gestion de votre activité logistique en temps réel.</div>

          {pageKey === "shipments" && (
            <div className="form-grid" style={{ marginTop: 12 }}>
              <div className="fgroup">
                <div className="flabel">Origine</div>
                <input className="finput" value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <div className="fgroup">
                <div className="flabel">Destination</div>
                <input className="finput" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <div className="fgroup">
                <div className="flabel">Poids (kg)</div>
                <input className="finput" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="fgroup" style={{ justifyContent: "end" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!origin || !destination || !weight) return;
                    createShipment({ origin, destination, weight_kg: weight });
                  }}
                >
                  + Creer expedition
                </button>
              </div>
            </div>
          )}

          {pageKey === "users" && (
            <div style={{ marginTop: 10 }}>
              {users.map((u) => (
                <button key={u.id} className="btn btn-ghost btn-sm" style={{ marginRight: 8, marginTop: 8 }} onClick={() => toggleUser(u.id)}>
                  {u.is_active ? "Desactiver" : "Activer"} {u.name}
                </button>
              ))}
            </div>
          )}

          {pageKey === "carriers" && (
            <div style={{ marginTop: 10 }}>
              {carrierRequests.map((c) => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => reviewCarrierRequest(c.id, "Valide")}>
                    {c.name}
                  </button>
                </div>
              ))}
              {carrierRequests.length === 0 && <span>Aucune demande en attente.</span>}
            </div>
          )}

          {pageKey === "tracking" && (
            <div style={{ marginTop: 10 }}>
              {(role === "carrier" || role === "admin") && trackingTargets.filter(o => o.status !== 'DELIVERED').map(o => (
                <button key={o.id} className="btn btn-primary btn-sm" onClick={() => updateTracking(o.id)}>
                  Simuler avancee GPS pour {o.reference}
                </button>
              ))}
            </div>
          )}

          {pageKey === "notifications" && (
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => markAllNotificationsRead()}>
                Tout marquer comme lu
              </button>
              <div style={{ marginTop: 8 }}>
                {notifications
                  .filter((n) => !n.is_read)
                  .map((n) => (
                    <button key={n.id} className="btn btn-ghost btn-sm" style={{ marginRight: 8, marginTop: 8 }} onClick={() => markNotificationRead(n.id)}>
                      Marquer lue: {n.message.substring(0, 20)}...
                    </button>
                  ))}
              </div>
            </div>
          )}

          {pageKey === "marketplace" && (
            <div style={{ marginTop: 10 }} className="pg-sub">
              Credits disponibles: {credits.available} tonnes • Budget cumule: {credits.spentEur}€
            </div>
          )}
        </div>
      </div>
      <DataTable title={data.title} columns={data.columns} rows={data.rows} />
    </>
  );
}

export function RoleReportPage({ role, pageKey }) {
  const { credits, shipments, exportReport } = usePlatform();
  const data = reportData[pageKey];
  const roleTitle = roleConfig[role]?.defaultTitle || "Espace";
  if (!data) return <div className="card-b">Aucun rapport disponible.</div>;

  const totalCo2 = shipments.reduce((sum, s) => sum + parseFloat(s.co2_kg || 0), 0).toFixed(2);

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-title">{data.title}</span>
      </div>
      <div className="card-b">
        <div className="pg-sub" style={{ marginBottom: 10 }}>
          Rapport généré automatiquement à partir de vos données d'activité.
        </div>
        {data.highlights.map((item) => (
          <div key={item} style={{ marginBottom: 8 }}>
            • {item}
          </div>
        ))}
        <div style={{ marginTop: 12, fontWeight: 600 }}>CO2 cumule expeditions: {totalCo2} kg</div>
        <div style={{ marginTop: 6 }}>Credits disponibles: {credits.available}</div>
        <div style={{ marginTop: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => exportReport(role, pageKey)}>
            Exporter PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoleProfilePage({ role }) {
  const { user } = useAuth();
  const roleMeta = roleConfig[role];
  return (
    <div className="card">
      <div className="card-h">
        <span className="card-title">Profil utilisateur</span>
      </div>
      <div className="card-b">
        <div style={{ marginBottom: 8 }}>
          <strong>Nom:</strong> {user?.name}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Email:</strong> {user?.email}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Role:</strong> {roleMeta?.subtitle}
        </div>
        <div className="pg-sub">Gérez vos informations personnelles et préférences de sécurité.</div>
      </div>
    </div>
  );
}

