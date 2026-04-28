const db = require('../config/db');

/**
 * Create a notification for a specific user.
 * @param {number} userId
 * @param {string} type
 * @param {string} message
 */
async function createNotification(userId, type, message) {
  try {
    await db.execute(
      'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      [userId, type, message]
    );
  } catch (err) {
    console.error('[notificationService] Failed to create notification:', err.message);
  }
}

/**
 * Notify all carriers about a new shipment.
 * @param {number} shipmentId
 * @param {string} reference
 * @param {string} origin
 * @param {string} destination
 */
async function notifyCarriersNewShipment(shipmentId, reference, origin, destination) {
  try {
    const [carriers] = await db.execute(
      'SELECT id FROM users WHERE role = ? AND is_active = 1',
      ['carrier']
    );
    for (const carrier of carriers) {
      await createNotification(
        carrier.id,
        'mission_assigned',
        `Nouvelle mission disponible: ${reference} — ${origin} → ${destination}`
      );
    }
  } catch (err) {
    console.error('[notificationService] notifyCarriersNewShipment error:', err.message);
  }
}

/**
 * Notify a specific user of a status update.
 */
async function notifyStatusUpdate(userId, reference, newStatus) {
  const labels = {
    PENDING:     'en attente',
    ASSIGNED:    'assignée',
    IN_PROGRESS: 'en cours de livraison',
    DELIVERED:   'livrée',
    CANCELLED:   'annulée',
  };
  await createNotification(
    userId,
    'status_update',
    `Mise à jour expédition ${reference}: ${labels[newStatus] || newStatus}`
  );
}

/**
 * Notify shipper when a carrier accepts/rejects their mission.
 */
async function notifyMissionResponse(shipperId, reference, carrierName, accepted) {
  await createNotification(
    shipperId,
    accepted ? 'mission_accepted' : 'mission_rejected',
    accepted
      ? `${carrierName} a accepté la mission ${reference}`
      : `${carrierName} a refusé la mission ${reference}`
  );
}

module.exports = {
  createNotification,
  notifyCarriersNewShipment,
  notifyStatusUpdate,
  notifyMissionResponse,
};
