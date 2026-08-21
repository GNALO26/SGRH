const haversineDistance = require('../utils/haversine');

/**
 * Vérifie si un point donné se trouve dans le rayon de géorepérage autorisé.
 * @param {number} userLat - Latitude de l'utilisateur.
 * @param {number} userLon - Longitude de l'utilisateur.
 * @param {number} companyLat - Latitude de l'entreprise.
 * @param {number} companyLon - Longitude de l'entreprise.
 * @param {number} radiusMeters - Rayon autorisé en mètres.
 * @returns {{ allowed: boolean, distance: number }} Résultat avec la distance.
 */
function isWithinGeofence(userLat, userLon, companyLat, companyLon, radiusMeters) {
  const distance = haversineDistance(userLat, userLon, companyLat, companyLon);
  return {
    allowed: distance <= radiusMeters,
    distance: Math.round(distance * 100) / 100 // arrondi à 2 décimales
  };
}

module.exports = { isWithinGeofence };