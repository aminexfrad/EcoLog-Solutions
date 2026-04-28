import DataTable from "../../components/DataTable";
import { reportData, roleConfig, tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";
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
  const [route, setRoute] = useState("Paris -> Lyon");
  const [carrier, setCarrier] = useState("EcoTrans");
  const [co2, setCo2] = useState("1.1");
  const [trackingShift, setTrackingShift] = useState(5);
  let data = tableData[pageKey];

  if (pageKey === "shipments") {
    data = { ...data, rows: shipments.map((s) => [s.id, s.route, s.carrier, `${s.co2} kg`, s.status]) };
  }
  if (pageKey === "missions") {
    data = { ...data, rows: missions.map((m) => [m.id, m.shipmentId, m.vehicle, m.status]) };
  }
  if (pageKey === "orders") {
    data = { ...data, rows: orders.map((o) => [o.id, o.shipmentId, "Electrique", o.eta, o.status]) };
  }
  if (pageKey === "users") {
    data = { ...data, rows: users.map((u) => [u.name, u.role, u.company, u.active ? "Actif" : "Inactif"]) };
  }
  if (pageKey === "carriers") {
    data = { ...data, rows: carrierRequests.map((c) => [c.name, c.score, `${c.fleet} vehicules`, c.status]) };
  }
  if (pageKey === "tracking") {
    data = {
      ...data,
      rows: tracking.map((t) => [t.shipmentId, `${t.progress}%`, t.eta, t.location, t.lastUpdate]),
    };
  }
  if (pageKey === "documents") {
    data = {
      ...data,
      rows: documents
        .filter((d) => role === "admin" || d.ownerRole === role || (role === "shipper" && d.ownerRole !== "admin"))
        .map((d) => [d.id, d.shipmentId, d.type, d.createdAt]),
    };
  }
  if (pageKey === "notifications") {
    data = {
      ...data,
      rows: notifications.filter((n) => n.role === role).map((n) => [n.text, n.read ? "Lue" : "Non lue"]),
    };
  }
  if (pageKey === "logs") {
    data = {
      ...data,
      rows: auditLogs.map((l) => [l.time, l.level, l.message]),
    };
  }

  const roleTitle = roleConfig[role]?.defaultTitle || "Espace";
  if (!data) return <div className="card-b">Aucune donnee disponible.</div>;
  return (
    <>
      <div className="card">
        <div className="card-b">
          <div className="pg-title">{roleTitle}</div>
          <div className="pg-sub">Workflow simule (mock data), pret pour API backend.</div>
          {pageKey === "shipments" && (
            <div className="form-grid" style={{ marginTop: 12 }}>
              <div className="fgroup">
                <div className="flabel">Trajet</div>
                <input className="finput" value={route} onChange={(e) => setRoute(e.target.value)} />
              </div>
              <div className="fgroup">
                <div className="flabel">Transporteur</div>
                <input className="finput" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
              </div>
              <div className="fgroup">
                <div className="flabel">CO2 estime (kg)</div>
                <input className="finput" value={co2} onChange={(e) => setCo2(e.target.value)} />
              </div>
              <div className="fgroup" style={{ justifyContent: "end" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!route || !carrier) return;
                    createShipment({ route, carrier, co2 });
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
                  {u.active ? "Desactiver" : "Activer"} {u.name}
                </button>
              ))}
            </div>
          )}
          {pageKey === "carriers" && (
            <div style={{ marginTop: 10 }}>
              {carrierRequests.map((c) => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => reviewCarrierRequest(c.id, "Valide")}>
                    Valider {c.name}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => reviewCarrierRequest(c.id, "Refuse")}>
                    Refuser
                  </button>
                </div>
              ))}
            </div>
          )}
          {pageKey === "tracking" && (
            <div style={{ marginTop: 10 }}>
              {tracking.map((t) => (
                <button
                  key={t.shipmentId}
                  className="btn btn-ghost btn-sm"
                  style={{ marginRight: 8, marginTop: 8 }}
                  onClick={() => updateTracking(t.shipmentId, t.progress + Number(trackingShift), `${t.location} - update`)}
                >
                  +{trackingShift}% {t.shipmentId}
                </button>
              ))}
              <input
                className="finput"
                type="number"
                value={trackingShift}
                onChange={(e) => setTrackingShift(e.target.value)}
                style={{ width: 90, marginTop: 8 }}
              />
            </div>
          )}
          {pageKey === "documents" && (
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => generateDocument("EXP-0247", "Facture", role)}>
                Generer facture EXP-0247
              </button>
            </div>
          )}
          {pageKey === "notifications" && (
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => markAllNotificationsRead(role)}>
                Tout marquer comme lu
              </button>
              <div style={{ marginTop: 8 }}>
                {notifications
                  .filter((n) => n.role === role && !n.read)
                  .map((n) => (
                    <button key={n.id} className="btn btn-ghost btn-sm" style={{ marginRight: 8, marginTop: 8 }} onClick={() => markNotificationRead(n.id)}>
                      Marquer lue
                    </button>
                  ))}
              </div>
            </div>
          )}
          {pageKey === "marketplace" && (
            <div style={{ marginTop: 10 }} className="pg-sub">
              Credits disponibles: {credits.available} • Budget cumule: {credits.spentEur}€
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
  const totalCo2 = shipments.reduce((sum, s) => sum + s.co2, 0).toFixed(2);
  return (
    <div className="card">
      <div className="card-h">
        <span className="card-title">{data.title}</span>
      </div>
      <div className="card-b">
        <div className="pg-sub" style={{ marginBottom: 10 }}>
          {roleTitle} - reporting frontend-only
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
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => exportReport(role, `${pageKey}-excel`)}>
            Exporter Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoleProfilePage({ role }) {
  const roleMeta = roleConfig[role];
  const user = roleMeta?.demoUser;
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
          <strong>Role:</strong> {roleMeta?.subtitle}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Score vert:</strong> {roleMeta?.score}
        </div>
        <div className="pg-sub">Cette page sera alimentee par le backend utilisateur.</div>
      </div>
    </div>
  );
}
