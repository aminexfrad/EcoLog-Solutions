import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import { dashboardData, tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";

export default function CarrierDashboard() {
  const { missions, setMissionStatus } = usePlatform();
  const rows = missions.map((m) => [m.id, m.shipmentId, m.vehicle, m.status]);
  return (
    <>
      <DashboardCards
        cards={dashboardData.carrier.cards}
      />
      <DataTable
        title={tableData.missions.title}
        columns={tableData.missions.columns}
        rows={rows}
      />
      <div className="card">
        <div className="card-h">
          <span className="card-title">Actions mission</span>
        </div>
        <div className="card-b">
          {missions.map((m) => (
            <div key={m.id} style={{ marginBottom: 8 }}>
              <span style={{ marginRight: 8 }}>{m.id}</span>
              <button className="btn btn-primary btn-sm" onClick={() => setMissionStatus(m.id, "Acceptee")}>
                Accepter
              </button>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => setMissionStatus(m.id, "En cours")}>
                Demarrer
              </button>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => setMissionStatus(m.id, "Livree")}>
                Livrer
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
