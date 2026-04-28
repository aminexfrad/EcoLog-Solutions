import { useMemo } from "react";
import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import { tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";

export default function CarrierDashboard() {
  const { missions, setMissionStatus } = usePlatform();
  const rows = missions.map((m) => [m.reference, `${m.origin} -> ${m.destination}`, m.vehicle_type, m.status]);

  const cards = useMemo(() => {
    return [
      { icon: "✅", value: missions.length.toString(), label: "Missions", trend: "Total", tone: "sc-green" },
      { icon: "⭐", value: "4.8", label: "Note moyenne", trend: "Globale", tone: "sc-navy" },
      { icon: "🌿", value: "94", label: "Score vert", trend: "Certifie", tone: "sc-green" },
      { icon: "💶", value: "Actif", label: "Statut", trend: "En ligne", tone: "sc-amber" },
    ];
  }, [missions]);

  return (
    <>
      <DashboardCards cards={cards} />
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
              <span style={{ marginRight: 8 }}>{m.reference} ({m.status})</span>
              {m.status === 'PENDING' && (
                <button className="btn btn-primary btn-sm" onClick={() => setMissionStatus(m.id, "ASSIGNED")}>
                  Accepter
                </button>
              )}
              {m.status === 'ASSIGNED' && (
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => setMissionStatus(m.id, "IN_PROGRESS")}>
                  Demarrer
                </button>
              )}
              {m.status === 'IN_PROGRESS' && (
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => setMissionStatus(m.id, "DELIVERED")}>
                  Livrer
                </button>
              )}
            </div>
          ))}
          {missions.length === 0 && <div>Aucune mission en cours.</div>}
        </div>
      </div>
    </>
  );
}
