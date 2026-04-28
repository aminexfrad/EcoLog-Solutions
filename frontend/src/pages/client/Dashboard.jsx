import { useState, useMemo } from "react";
import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";

export default function ClientDashboard() {
  const [open, setOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const { orders, rateOrder } = usePlatform();

  const rows = orders.map((o) => [
    o.reference,
    `${o.origin} -> ${o.destination}`,
    o.vehicle_type || "-",
    o.deadline ? new Date(o.deadline).toLocaleDateString() : "-",
    <button
      key={o.id}
      className="btn btn-ghost btn-sm"
      onClick={() => {
        setSelectedOrderId(o.id);
        setOpen(true);
      }}
    >
      Noter
    </button>,
  ]);

  const cards = useMemo(() => {
    const active = orders.filter(o => o.status !== 'DELIVERED').length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    return [
      { icon: "📦", value: active.toString(), label: "Commandes en cours", trend: "Total", tone: "sc-green" },
      { icon: "🌿", value: "100%", label: "Expedies sans CO2", trend: "Green certifie", tone: "sc-navy" },
      { icon: "🚚", value: delivered.toString(), label: "Colis arrives", trend: "Termines", tone: "sc-green" },
    ];
  }, [orders]);

  return (
    <>
      <DashboardCards cards={cards} />
      <DataTable
        title={tableData.orders.title}
        columns={[...tableData.orders.columns, "Action"]}
        rows={rows}
      />
      <Modal
        open={open}
        title="⭐ Noter la livraison"
        onClose={() => setOpen(false)}
        onConfirm={() => {
          if (selectedOrderId) rateOrder(selectedOrderId, Number(rating));
          setOpen(false);
        }}
        confirmLabel="Envoyer ma note"
      >
        <div className="fgroup">
          <div className="flabel">Note /5</div>
          <input className="finput" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
        </div>
        <div className="fgroup"><div className="flabel">Commentaire</div><textarea className="ftextarea" /></div>
      </Modal>
    </>
  );
}
