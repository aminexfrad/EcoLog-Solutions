import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const PlatformContext = createContext(null);

export function PlatformProvider({ children }) {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [missions, setMissions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [carrierRequests, setCarrierRequests] = useState([]);
  const [credits, setCredits] = useState({ available: 0, spentTnd: 0 });
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setShipments([]); setMissions([]); setOrders([]); setUsers([]);
      setCarrierRequests([]); setCredits({ available: 0, spentTnd: 0 });
      setNotifications([]); setDocuments([]); setAuditLogs([]); setTracking([]);
      return;
    }
    setLoading(true);
    try {
      if (user.role === 'admin') {
        const [usersRes, logsRes] = await Promise.all([api.get('/users'), api.get('/audit/logs')]);
        setUsers(usersRes.data);
        setCarrierRequests(usersRes.data.filter(u => u.role === 'carrier' && !u.is_active));
        setAuditLogs(logsRes.data);
      }
      
      if (user.role === 'shipper' || user.role === 'admin') {
        const [shipRes, compRes] = await Promise.all([api.get('/shipments'), api.get('/compensations')]);
        setShipments(shipRes.data);
        setCredits({ available: compRes.data.total_tons || 0, spentTnd: compRes.data.total_tnd || 0 });
      }

      if (user.role === 'carrier') {
        const [missRes, vehRes] = await Promise.all([api.get('/missions'), api.get('/vehicles')]);
        setMissions(missRes.data);
        setFleet(vehRes.data);
      }

      if (user.role === 'client') {
        const shipRes = await api.get('/shipments');
        setOrders(shipRes.data);
        if (shipRes.data.length > 0) {
           const active = shipRes.data.find(s => s.status !== 'DELIVERED');
           if (active) {
             const tRes = await api.get(`/tracking/${active.id}`);
             setTracking(tRes.data.history || []);
           }
        }
      }

      const [notifRes, docRes] = await Promise.all([api.get('/notifications'), api.get('/documents')]);
      setNotifications(notifRes.data.notifications || []);
      setDocuments(docRes.data || []);
      
    } catch (e) {
      console.error('Failed to fetch platform data', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const createShipment = async (payload) => {
    const res = await api.post('/shipments', payload);
    await fetchDashboardData();
    return res.data;
  };

  const assignCarrier = async (shipmentId, carrierId) => {
    await api.patch(`/shipments/${shipmentId}/assign`, { carrier_id: carrierId });
    await fetchDashboardData();
  };

  const buyCredits = async (tons) => {
    const res = await api.post('/compensations', { tons });
    await fetchDashboardData();
    return res.data;
  };

  const acceptMission = async (missionId) => {
    await api.patch(`/missions/${missionId}/accept`);
    await fetchDashboardData();
  };

  const rejectMission = async (missionId) => {
    await api.patch(`/missions/${missionId}/reject`);
    await fetchDashboardData();
  };

  const setMissionStatus = async (missionId, status) => {
    await api.patch(`/missions/${missionId}/status`, { status });
    await fetchDashboardData();
  };

  const toggleUser = async (userId) => {
    await api.patch(`/users/${userId}/toggle`);
    await fetchDashboardData();
  };

  const reviewCarrierRequest = async (requestId, status) => {
    if (status === "Valide") {
       await toggleUser(requestId);
    }
  };

  const markNotificationRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    await fetchDashboardData();
  };

  const markAllNotificationsRead = async () => {
    await api.patch(`/notifications/read-all`);
    await fetchDashboardData();
  };

  const updateTracking = async (shipmentId) => {
    if (user?.role !== "carrier" && user?.role !== "admin") return;
    await api.post(`/tracking/${shipmentId}/simulate`);
    await fetchDashboardData();
  };
  
  const generateDocument = async (shipmentId, type) => {
    await api.post('/documents', { shipment_id: shipmentId, type });
    await fetchDashboardData();
  };

  const rateOrder = async (orderId, rating) => {
    // Optional feature for later
  };

  const exportReport = (role, type) => {
    // Simulate export
    alert(`Export en cours: ${type}`);
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
      fleet,
      loading,
      createShipment,
      assignCarrier,
      acceptMission,
      rejectMission,
      buyCredits,
      setMissionStatus,
      rateOrder,
      toggleUser,
      reviewCarrierRequest,
      markNotificationRead,
      markAllNotificationsRead,
      updateTracking,
      exportReport,
      generateDocument,
      fetchDashboardData,
    }),
    [shipments, missions, orders, users, carrierRequests, credits, notifications, documents, auditLogs, tracking, fleet, loading, fetchDashboardData]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used inside PlatformProvider");
  return ctx;
}
