import { useState, useMemo } from "react";
import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";
import { formatCurrencyTND } from "../../utils/format";

export default function ShipperDashboard() {
  const [open, setOpen] = useState(false);
  const [tons, setTons] = useState(2);
  const [origin, setOrigin] = useState("Paris 75001");
  const [destination, setDestination] = useState("Lyon 69001");
  const [weight, setWeight] = useState("5000");
  const [clientEmail, setClientEmail] = useState("client@ecolog.fr");

  const { buyCredits, credits, shipments, createShipment } = usePlatform();

  const rows = shipments.slice(0, 6).map((s) => [s.reference, `${s.origin} -> ${s.destination}`, s.carrier_name || "Non assigne", s.co2_kg ? `${s.co2_kg} kg` : "-", s.status]);

  const cards = useMemo(() => {
    const totalCo2 = shipments.reduce((sum, s) => sum + parseFloat(s.co2_kg || 0), 0);
    return [
      { icon: "📦", value: shipments.length.toString(), label: "Expeditions", trend: "Total", tone: "sc-green" },
      { icon: "🌡️", value: `${totalCo2.toFixed(1)} kg`, label: "CO2 emis", trend: "Cumul", tone: "sc-navy" },
      { icon: "💰", value: credits.available.toString(), label: "Credits carbone (t)", trend: "Disponibles", tone: "sc-amber" },
      { icon: "♻️", value: formatCurrencyTND(credits.spentTnd), label: "Investissement", trend: "Cumul", tone: "sc-green" },
    ];
  }, [shipments, credits]);

  const handleCreate = async () => {
    if (!origin || !destination || !weight) return;
    await createShipment({ origin, destination, weight_kg: weight, client_email: clientEmail || null });
    setOpen(false);
  };

  return (
    <>
      <DashboardCards cards={cards} />
      <DataTable
        title={tableData.shipments.title}
        columns={tableData.shipments.columns}
        rows={rows}
      />
      <div className="card">
        <div className="card-h">
          <span className="card-title">Compensation carbone</span>
        </div>
        <div className="card-b dash-inline-form">
          <input className="finput" type="number" value={tons} onChange={(e) => setTons(e.target.value)} />
          <button className="btn btn-primary" onClick={() => buyCredits(tons)}>
            Acheter credits
          </button>
          <span className="subtle-chip">Credits actuels: {credits.available} t</span>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        ＋ Nouvelle expedition
      </button>
      <Modal open={open} title="📦 Nouvelle expedition" onClose={() => setOpen(false)} onConfirm={handleCreate} confirmLabel="Creer l'expedition">
        <div className="form-grid">
          <div className="fgroup"><div className="flabel">Origine</div><input className="finput" value={origin} onChange={e => setOrigin(e.target.value)} /></div>
          <div className="fgroup"><div className="flabel">Destination</div><input className="finput" value={destination} onChange={e => setDestination(e.target.value)} /></div>
          <div className="fgroup"><div className="flabel">Poids (kg)</div><input className="finput" type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div className="fgroup"><div className="flabel">Email du client (optionnel)</div><input className="finput" value={clientEmail} onChange={e => setClientEmail(e.target.value)} /></div>
        </div>
      </Modal>
    </>
  );
}
