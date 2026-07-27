<?php

namespace App\Services;

use App\Models\User;

class GeoFencingService
{
    public function isEmployeeAtOffice(User $employee, float $latitude, float $longitude): bool
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin || is_null($admin->company_latitude) || is_null($admin->company_longitude)) {
            throw new \RuntimeException('La configuration de l\'entreprise (coordonnées GPS) n\'a pas encore été définie par l\'administrateur.');
        }
        return HaversineService::isWithinRadius(
            $latitude,
            $longitude,
            $admin->company_latitude,
            $admin->company_longitude,
            $admin->geofence_radius_meters
        );
    }
}