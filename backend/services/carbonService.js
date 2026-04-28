/**
 * Carbon Footprint Calculator Service
 * Formula: CO2 (kg) = distance_km × weight_tons × emission_factor_g_per_t_km / 1000
 *
 * Emission factors (g CO2 / t.km) — based on ADEME / GHG Protocol
 */

const EMISSION_FACTORS = {
  diesel:   62.0,
  electric:  7.0,
  biogas:   40.0,
  rail:     18.0,
  hybrid:   35.0,
};

const DEFAULT_FACTOR = EMISSION_FACTORS.diesel;

/**
 * Get emission factor for a vehicle/transport type.
 * @param {string} vehicleType
 * @returns {number} g CO2 / t.km
 */
function getEmissionFactor(vehicleType) {
  return EMISSION_FACTORS[vehicleType?.toLowerCase()] ?? DEFAULT_FACTOR;
}

/**
 * Calculate CO2 emissions in kg.
 * @param {number} distanceKm
 * @param {number} weightKg
 * @param {string} vehicleType
 * @returns {{ co2_kg: number, emission_factor: number, distance_km: number, weight_tons: number }}
 */
function calculateCO2(distanceKm, weightKg, vehicleType = 'diesel') {
  const factor = getEmissionFactor(vehicleType);
  const weight_tons = weightKg / 1000;
  const co2_kg = (distanceKm * weight_tons * factor) / 1000;

  return {
    co2_kg:         parseFloat(co2_kg.toFixed(4)),
    emission_factor: factor,
    distance_km:     distanceKm,
    weight_tons:     parseFloat(weight_tons.toFixed(4)),
  };
}

/**
 * Compare transport options for a given shipment.
 * @param {number} distanceKm
 * @param {number} weightKg
 * @returns {Array}
 */
function compareOptions(distanceKm, weightKg) {
  return Object.entries(EMISSION_FACTORS).map(([type, factor]) => {
    const result = calculateCO2(distanceKm, weightKg, type);
    return {
      vehicle_type:    type,
      emission_factor: factor,
      co2_kg:          result.co2_kg,
      label:           `${type.charAt(0).toUpperCase() + type.slice(1)} — ${result.co2_kg} kg CO₂`,
    };
  }).sort((a, b) => a.co2_kg - b.co2_kg);
}

/**
 * Estimate distance from city names (simple lookup for demo).
 * In production this would call a routing API (Google Maps / OSRM).
 */
function estimateDistance(origin, destination) {
  // Common French city pairs (km)
  const lookup = {
    'paris-lyon': 465, 'lyon-paris': 465,
    'paris-marseille': 776, 'marseille-paris': 776,
    'paris-bordeaux': 584, 'bordeaux-paris': 584,
    'paris-lille': 225, 'lille-paris': 225,
    'paris-strasbourg': 488, 'strasbourg-paris': 488,
    'paris-nantes': 385, 'nantes-paris': 385,
    'lyon-marseille': 315, 'marseille-lyon': 315,
    'marseille-bordeaux': 642, 'bordeaux-marseille': 642,
    'lille-strasbourg': 525, 'strasbourg-lille': 525,
    'bordeaux-lyon': 553, 'lyon-bordeaux': 553,
  };

  const key = `${origin.split(' ')[0].toLowerCase()}-${destination.split(' ')[0].toLowerCase()}`;
  return lookup[key] || 500; // default 500km if unknown
}

module.exports = { calculateCO2, compareOptions, estimateDistance, getEmissionFactor, EMISSION_FACTORS };
