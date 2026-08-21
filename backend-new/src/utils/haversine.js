/**
 * Calcule la distance en mètres entre deux points GPS.
 * @param {number} lat1 - Latitude du premier point.
 * @param {number} lon1 - Longitude du premier point.
 * @param {number} lat2 - Latitude du second point.
 * @param {number} lon2 - Longitude du second point.
 * @returns {number} Distance en mètres.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = haversineDistance;