import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios'; // Votre instance Axios configurée avec Sanctum
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  ShieldAlert, 
  Building 
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Géolocalisation de l'utilisateur
  const [userCoords, setUserCoords] = useState({ latitude: null, longitude: null });
  const [geoError, setGeoError] = useState(null);
  const [distanceToCompany, setDistanceToCompany] = useState(null);
  const [isWithinFence, setIsWithinFence] = useState(false);

  // Formulaire de pointage
  const [justification, setJustification] = useState('');
  const [needJustification, setNeedJustification] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // 1. Calcul de la distance Haversine en mètres
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  // 2. Capture de la position GPS de l'employé
  const fetchLocation = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });

        // Mise à jour de la vérification de périmètre
        if (dashboardData?.company_location) {
          const { latitude: compLat, longitude: compLng, geofence_radius } = dashboardData.company_location;
          if (compLat && compLng) {
            const dist = calculateDistance(latitude, longitude, compLat, compLng);
            setDistanceToCompany(dist);
            setIsWithinFence(dist <= (geofence_radius || 100));
          }
        }
      },
      (error) => {
        let msg = "Erreur de géolocalisation.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Vous devez autoriser l'accès à la localisation pour pouvoir pointer.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Signal GPS indisponible.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Délai d'attente dépassé pour obtenir votre position.";
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [dashboardData?.company_location]);

  // 3. Charger les données du tableau de bord depuis l'API Laravel
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/employee/dashboard');
      if (response.data.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || "Impossible de charger les données du tableau de bord.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      fetchLocation();
    }
  }, [dashboardData, fetchLocation]);

  // 4. Soumission du pointage
  const handleCheckIn = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    if (!userCoords.latitude || !userCoords.longitude) {
      setFeedback({ type: 'error', message: 'Position GPS introuvable. Veuillez activer le GPS.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('/api/attendances/check-in', {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        justification: justification.trim() || null,
      });

      setFeedback({
        type: 'success',
        message: response.data.message || 'Pointage enregistré avec succès !',
      });
      setJustification('');
      setNeedJustification(false);
      
      // Recharger le tableau de bord pour rafraîchir l'état
      await loadDashboardData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du pointage.';
      setFeedback({ type: 'error', message: errorMsg });

      // Si le serveur requiert une justification pour un grand retard
      if (err.response?.data?.require_justification) {
        setNeedJustification(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 font-medium">Chargement des données...</span>
      </div>
    );
  }

  const { can_check_in, already_checked_in, official_opening_time, official_closing_time, latest_attendance, company_location } = dashboardData || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Espace Pointage</h1>
          <p className="text-sm text-gray-500">Gérez votre présence quotidienne en temps réel</p>
        </div>
        <div className="flex items-center space-x-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
          <Clock className="w-4 h-4" />
          <span>Horaire : {official_opening_time?.slice(0, 5)} - {official_closing_time?.slice(0, 5)}</span>
        </div>
      </div>

      {/* Messages d'alerte / Feedback */}
      {feedback.message && (
        <div className={`p-4 rounded-xl flex items-start space-x-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
          )}
          <div className="text-sm font-medium">{feedback.message}</div>
        </div>
      )}

      {/* Cartes d'information principale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Carte 1 : Statut du jour */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut d'aujourd'hui</span>
            <div className="mt-3 flex items-center space-x-3">
              {already_checked_in ? (
                <div className="flex items-center space-x-2 text-emerald-600 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Présence enregistrée</span>
                </div>
              ) : can_check_in ? (
                <div className="flex items-center space-x-2 text-amber-600 font-bold text-lg">
                  <Clock className="w-6 h-6" />
                  <span>Pointage ouvert</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500 font-bold text-lg">
                  <XCircle className="w-6 h-6" />
                  <span>Pointage indisponible</span>
                </div>
              )}
            </div>
          </div>

          {latest_attendance && (
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Dernier pointage :</span>
                <span className="font-semibold text-gray-900">
                  {new Date(latest_attendance.check_in_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Statut :</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  latest_attendance.status === 'on_time' ? 'bg-emerald-100 text-emerald-800' :
                  latest_attendance.status === 'late' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {latest_attendance.status === 'on_time' ? 'À l\'heure' :
                   latest_attendance.status === 'late' ? `Retard (${latest_attendance.late_minutes} min)` : 'Grand retard'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Carte 2 : Périmètre & Localisation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Géofencing GPS</span>
              <button 
                onClick={fetchLocation} 
                className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                title="Actualiser le GPS"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Actualiser</span>
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {geoError ? (
                <div className="text-sm text-red-600 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{geoError}</span>
                </div>
              ) : userCoords.latitude ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Distance du siège : <strong>{distanceToCompany !== null ? `${distanceToCompany} m` : 'Calcul...'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>Périmètre autorisé : <strong>{company_location?.geofence_radius || 100} m</strong></span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Recherche de la position GPS...</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            {isWithinFence ? (
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Dans la zone autorisée
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Hors de la zone autorisée
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Formulaire de Pointage */}
      {!already_checked_in && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Marquer mon arrivée</h2>

          <form onSubmit={handleCheckIn} className="space-y-4">
            
            {(needJustification || latest_attendance?.status === 'very_late') && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-amber-800">
                  Motif du retard (Obligatoire) *
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Veuillez préciser la raison de votre retard..."
                  className="w-full p-3 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!can_check_in || submitting || !isWithinFence || !!geoError}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                can_check_in && isWithinFence && !geoError && !submitting
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.99]'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Valider mon pointage</span>
                </>
              )}
            </button>

            {!isWithinFence && !geoError && (
              <p className="text-xs text-center text-red-500">
                Vous devez vous rapprocher des locaux de l'entreprise pour pouvoir valider votre pointage.
              </p>
            )}
          </form>
        </div>
      )}

    </div>
  );
}