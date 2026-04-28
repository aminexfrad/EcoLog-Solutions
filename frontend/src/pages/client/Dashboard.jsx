import { useState } from "react";
import DashboardCards from "../../components/DashboardCards";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { dashboardData, tableData } from "../../data/mockData";
import { usePlatform } from "../../context/PlatformContext";

export default function ClientDashboard() {
  const [open, setOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const { orders, rateOrder } = usePlatform();
  const rows = orders.map((o) => [
    o.id,
    o.shipmentId,
    "Electrique",
    o.eta,
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
  return (
    <>
      <DashboardCards
        cards={dashboardData.client.cards}
      />
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
