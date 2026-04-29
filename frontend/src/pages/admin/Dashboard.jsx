import { useMemo } from "react";
import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import { tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";

export default function AdminDashboard() {
  const { users, carrierRequests, toggleUser, reviewCarrierRequest, shipments, credits } = usePlatform();

  const rows = carrierRequests.map((c) => [c.name, c.green_score, `${c.vehicle_count || 0} vehicules`, c.is_active ? "Valide" : "En revue"]);

  const cards = useMemo(() => {
    return [
      { icon: "👥", value: users.length.toString(), label: "Utilisateurs", trend: "Actifs", tone: "sc-navy" },
      { icon: "🚚", value: users.filter(u => u.role === 'carrier').length.toString(), label: "Transporteurs", trend: "Total", tone: "sc-green" },
      { icon: "🌍", value: `${credits.available} t`, label: "Total CO2 compense", trend: "Global", tone: "sc-green" },
      { icon: "📦", value: shipments.length.toString(), label: "Total Expeditions", trend: "Plateforme", tone: "sc-amber" },
    ];
  }, [users, credits, shipments]);

  return (
    <>
      <DashboardCards cards={cards} />
      <DataTable
        title={tableData.carriers.title}
        columns={tableData.carriers.columns}
        rows={rows}
      />
      <div className="card">
        <div className="card-h">
          <span className="card-title">Administration rapide</span>
        </div>
        <div className="card-b actions-grid">
          <div className="actions-toolbar">
            {users.map((u) => (
              <button key={u.id} className="btn btn-ghost btn-sm" onClick={() => toggleUser(u.id)}>
                {u.is_active ? "Desactiver" : "Activer"} {u.name}
              </button>
            ))}
          </div>
          <div className="actions-toolbar">
            {carrierRequests.map((c) => (
              <button key={c.id} className="btn btn-primary btn-sm" onClick={() => reviewCarrierRequest(c.id, "Valide")}>
                Valider {c.name}
              </button>
            ))}
            {carrierRequests.length === 0 && <span>Aucune validation en attente.</span>}
          </div>
        </div>
      </div>
    </>
  );
}
