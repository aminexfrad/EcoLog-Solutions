import { useState } from "react";
import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { dashboardData, tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";

export default function ShipperDashboard() {
  const [open, setOpen] = useState(false);
  const [tons, setTons] = useState(2);
  const { buyCredits, credits, shipments } = usePlatform();
  const rows = shipments.slice(0, 6).map((s) => [s.id, s.route, s.carrier, `${s.co2} kg`, s.status]);
  return (
    <>
      <DashboardCards
        cards={dashboardData.shipper.cards}
      />
      <DataTable
        title={tableData.shipments.title}
        columns={tableData.shipments.columns}
        rows={rows}
      />
      <div className="card">
        <div className="card-h">
          <span className="card-title">Compensation carbone</span>
        </div>
        <div className="card-b" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input className="finput" type="number" value={tons} onChange={(e) => setTons(e.target.value)} style={{ width: 120 }} />
          <button className="btn btn-primary" onClick={() => buyCredits(tons)}>
            Acheter credits
          </button>
          <span>Credits actuels: {credits.available}</span>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => setOpen(true)} style={{ marginTop: 14 }}>
        ＋ Nouvelle expedition
      </button>
      <Modal open={open} title="📦 Nouvelle expedition" onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} confirmLabel="Creer l'expedition">
        <div className="form-grid">
          <div className="fgroup"><div className="flabel">Origine</div><input className="finput" defaultValue="Paris 75001" /></div>
          <div className="fgroup"><div className="flabel">Destination</div><input className="finput" defaultValue="Lyon 69001" /></div>
        </div>
      </Modal>
    </>
  );
}
