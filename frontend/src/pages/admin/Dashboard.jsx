import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import { dashboardData, tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";

export default function AdminDashboard() {
  const { users, carrierRequests, toggleUser, reviewCarrierRequest } = usePlatform();
  const rows = carrierRequests.map((c) => [c.name, c.score, `${c.fleet} vehicules`, c.status]);
  return (
    <>
      <DashboardCards
        cards={dashboardData.admin.cards}
      />
      <DataTable
        title={tableData.carriers.title}
        columns={tableData.carriers.columns}
        rows={rows}
      />
      <div className="card">
        <div className="card-h">
          <span className="card-title">Administration rapide</span>
        </div>
        <div className="card-b">
          <div style={{ marginBottom: 12 }}>
            {users.map((u) => (
              <button key={u.id} className="btn btn-ghost btn-sm" style={{ marginRight: 8, marginTop: 8 }} onClick={() => toggleUser(u.id)}>
                {u.active ? "Desactiver" : "Activer"} {u.name}
              </button>
            ))}
          </div>
          <div>
            {carrierRequests.map((c) => (
              <button key={c.id} className="btn btn-primary btn-sm" style={{ marginRight: 8, marginTop: 8 }} onClick={() => reviewCarrierRequest(c.id, "Valide")}>
                Valider {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
