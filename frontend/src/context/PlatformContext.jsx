import { createContext, useContext, useMemo, useState } from "react";

const PlatformContext = createContext(null);

const seed = {
  shipments: [
    { id: "EXP-0247", route: "Paris -> Lyon", shipper: "DistriVert", carrier: "EcoTrans", co2: 1.2, status: "En transit" },
    { id: "EXP-0246", route: "Marseille -> Bordeaux", shipper: "DistriVert", carrier: "RailGreen", co2: 0.8, status: "En attente" },
  ],
  missions: [
    { id: "MIS-980", shipmentId: "EXP-0247", carrier: "EcoTrans", vehicle: "Mercedes eActros", status: "Acceptee" },
    { id: "MIS-979", shipmentId: "EXP-0246", carrier: "RailGreen", vehicle: "Volvo FH Electric", status: "Proposee" },
  ],
  orders: [
    { id: "CMD-2201", shipmentId: "EXP-0247", customer: "Claire Bonnet", eta: "14h32", status: "En transit", rating: null },
    { id: "CMD-2200", shipmentId: "EXP-0246", customer: "Claire Bonnet", eta: "Livree", status: "Terminee", rating: 5 },
  ],
  users: [
    { id: "USR-01", name: "Marie Leblanc", role: "shipper", company: "DistriVert", active: true },
    { id: "USR-02", name: "Jean Dupont", role: "carrier", company: "EcoTrans", active: true },
    { id: "USR-03", name: "Claire Bonnet", role: "client", company: "Retail Plus", active: true },
  ],
  carrierRequests: [
    { id: "CR-01", name: "Urban Freight", score: 66, fleet: 6, status: "En revue" },
    { id: "CR-02", name: "EcoRail Plus", score: 88, fleet: 14, status: "En revue" },
  ],
  credits: { available: 128, spentEur: 24180 },
  notifications: [
    { id: "N1", role: "shipper", text: "Mission EXP-0247 acceptee par EcoTrans", read: false },
    { id: "N2", role: "client", text: "Votre commande CMD-2201 est en transit", read: false },
    { id: "N3", role: "admin", text: "Nouveau transporteur en attente de validation", read: false },
  ],
  documents: [
    { id: "DOC-001", shipmentId: "EXP-0247", type: "CMR", ownerRole: "shipper", createdAt: "2026-04-27" },
    { id: "DOC-002", shipmentId: "EXP-0247", type: "Bon de livraison", ownerRole: "client", createdAt: "2026-04-28" },
  ],
  auditLogs: [
    { id: "LOG-01", level: "INFO", message: "Connexion utilisateur marie.leblanc@distrivert.fr", time: "14:21:03" },
    { id: "LOG-02", level: "WARN", message: "Retard GPS detecte sur EXP-0246", time: "14:18:41" },
  ],
  tracking: [
    { shipmentId: "EXP-0247", progress: 72, eta: "14h32", location: "Auxerre A6", lastUpdate: "2 min" },
    { shipmentId: "EXP-0246", progress: 26, eta: "18h05", location: "Valence", lastUpdate: "5 min" },
  ],
};

export function PlatformProvider({ children }) {
  const [shipments, setShipments] = useState(seed.shipments);
  const [missions, setMissions] = useState(seed.missions);
  const [orders, setOrders] = useState(seed.orders);
  const [users, setUsers] = useState(seed.users);
  const [carrierRequests, setCarrierRequests] = useState(seed.carrierRequests);
  const [credits, setCredits] = useState(seed.credits);
  const [notifications, setNotifications] = useState(seed.notifications);
  const [documents, setDocuments] = useState(seed.documents);
  const [auditLogs, setAuditLogs] = useState(seed.auditLogs);
  const [tracking, setTracking] = useState(seed.tracking);

  const createShipment = ({ route, carrier, co2 = 1.1 }) => {
    const id = `EXP-${String(248 + shipments.length).padStart(4, "0")}`;
    const shipment = { id, route, shipper: "DistriVert", carrier, co2: Number(co2), status: "En attente" };
    setShipments((prev) => [shipment, ...prev]);
    const mission = { id: `MIS-${980 + missions.length}`, shipmentId: id, carrier, vehicle: "A affecter", status: "Proposee" };
    setMissions((prev) => [mission, ...prev]);
    setNotifications((prev) => [{ id: crypto.randomUUID(), role: "shipper", text: `Expedition ${id} creee`, read: false }, ...prev]);
    return shipment;
  };

  const buyCredits = (tons) => {
    const qty = Number(tons) || 0;
    const price = qty * 18;
    setCredits((prev) => ({ available: prev.available + qty, spentEur: prev.spentEur + price }));
    return price;
  };

  const setMissionStatus = (missionId, status) => {
    setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, status } : m)));
    const mission = missions.find((m) => m.id === missionId);
    if (mission?.shipmentId) {
      const shipStatus = status === "Acceptee" ? "Planifiee" : status === "En cours" ? "En transit" : status === "Livree" ? "Livree" : "En attente";
      setShipments((prev) => prev.map((s) => (s.id === mission.shipmentId ? { ...s, status: shipStatus } : s)));
      setOrders((prev) => prev.map((o) => (o.shipmentId === mission.shipmentId ? { ...o, status: shipStatus === "Livree" ? "Terminee" : shipStatus } : o)));
      setNotifications((prev) => [
        { id: crypto.randomUUID(), role: "client", text: `Mise a jour livraison ${mission.shipmentId}: ${shipStatus}`, read: false },
        ...prev,
      ]);
      if (status === "Livree") {
        setDocuments((prev) => [
          { id: `DOC-${String(prev.length + 1).padStart(3, "0")}`, shipmentId: mission.shipmentId, type: "Bon de livraison", ownerRole: "client", createdAt: "2026-04-28" },
          ...prev,
        ]);
      }
    }
  };

  const rateOrder = (orderId, rating) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, rating } : o)));
  };

  const toggleUser = (userId) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)));
  };

  const reviewCarrierRequest = (requestId, status) => {
    setCarrierRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
    setAuditLogs((prev) => [
      { id: `LOG-${String(prev.length + 1).padStart(2, "0")}`, level: "INFO", message: `Validation transporteur ${requestId}: ${status}`, time: "16:07:12" },
      ...prev,
    ]);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = (role) => {
    setNotifications((prev) => prev.map((n) => (n.role === role ? { ...n, read: true } : n)));
  };

  const exportReport = (role, type) => {
    setAuditLogs((prev) => [
      { id: `LOG-${String(prev.length + 1).padStart(2, "0")}`, level: "INFO", message: `Export ${type} pour role ${role}`, time: "16:30:00" },
      ...prev,
    ]);
  };

  const generateDocument = (shipmentId, type, ownerRole) => {
    const doc = {
      id: `DOC-${String(documents.length + 1).padStart(3, "0")}`,
      shipmentId,
      type,
      ownerRole,
      createdAt: "2026-04-28",
    };
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  };

  const updateTracking = (shipmentId, progress, location) => {
    setTracking((prev) =>
      prev.map((t) =>
        t.shipmentId === shipmentId
          ? { ...t, progress: Math.max(0, Math.min(100, progress)), location, lastUpdate: "A l'instant" }
          : t
      )
    );
  };

  const value = useMemo(
    () => ({
      shipments,
      missions,
      orders,
      users,
      carrierRequests,
      credits,
      notifications,
      documents,
      auditLogs,
      tracking,
      createShipment,
      buyCredits,
      setMissionStatus,
      rateOrder,
      toggleUser,
      reviewCarrierRequest,
      markNotificationRead,
      markAllNotificationsRead,
      exportReport,
      generateDocument,
      updateTracking,
    }),
    [shipments, missions, orders, users, carrierRequests, credits, notifications, documents, auditLogs, tracking]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used inside PlatformProvider");
  return ctx;
}
