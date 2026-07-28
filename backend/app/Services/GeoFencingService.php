<?php

namespace App\Services;

class GeoFencingService
{
    /**
     * Calcule la distance entre deux points GPS en mètres (Formule de Haversine).
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Rayon de la Terre en mètres

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo   = deg2rad($lat2);
        $lonTo   = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return $earthRadius * $angle;
    }

    /**
     * Vérifie si l'employé se trouve dans le rayon autorisé.
     */
    public function isWithinRadius(float $userLat, float $userLon, float $companyLat, float $companyLon, float $allowedRadiusInMeters): bool
    {
        $distance = $this->calculateDistance($userLat, $userLon, $companyLat, $companyLon);

        return $distance <= $allowedRadiusInMeters;
    }
}