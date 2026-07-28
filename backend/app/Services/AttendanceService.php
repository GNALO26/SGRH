<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Exception;

class AttendanceService
{
    protected GeoFencingService $geoFencingService;

    public function __construct(GeoFencingService $geoFencingService)
    {
        $this->geoFencingService = $geoFencingService;
    }

    /**
     * Traite la tentative de pointage d'un employé.
     *
     * @throws Exception
     */
    public function attemptCheckIn(User $user, float $latitude, float $longitude, ?string $justification = null): Attendance
    {
        $now = Carbon::now();
        $today = $now->toDateString();

        // 1. Récupération de l'Admin / Configuration
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            throw new Exception("Configuration d'entreprise introuvable.");
        }

        // 2. Vérification du double pointage
        $alreadyCheckedIn = Attendance::where('user_id', $user->id)
            ->whereDate('check_in_time', $today)
            ->exists();

        if ($alreadyCheckedIn) {
            throw new Exception("Vous avez déjà marqué votre présence aujourd'hui.");
        }

        // 3. Calcul de la fenêtre horaire autorisée
        $openingStr = $admin->official_opening_time ?? '08:00:00';
        $closingStr = $admin->official_closing_time ?? '20:00:00';

        $openingTime = Carbon::parse($today . ' ' . $openingStr);
        $closingTime = Carbon::parse($today . ' ' . $closingStr);

        if ($closingTime->lessThanOrEqualTo($openingTime)) {
            if ($now->lessThanOrEqualTo($closingTime)) {
                $openingTime->subDay();
            } else {
                $closingTime->addDay();
            }
        }

        $startWindow = (clone $openingTime)->subHour();
        $endWindow   = (clone $closingTime)->subHours(3);

        if (!$now->between($startWindow, $endWindow)) {
            throw new Exception("Le pointage n'est pas autorisé à cette heure ci.");
        }

        // 4. Validation de la Géolocalisation
        if ($admin->company_latitude && $admin->company_longitude) {
            $radius = $admin->geofence_radius_meters ?? 100;
            $isWithinFence = $this->geoFencingService->isWithinRadius(
                $latitude,
                $longitude,
                (float) $admin->company_latitude,
                (float) $admin->company_longitude,
                (float) $radius
            );

            if (!$isWithinFence) {
                throw new Exception("Vous devez être dans le périmètre de l'entreprise pour pointer.");
            }
        }

        // 5. Calcul du statut et du retard
        $attendanceData = $this->calculateStatusAndLateMinutes($now, $openingTime);

        if ($attendanceData['status'] === 'very_late' && empty($justification)) {
            throw new Exception("Un grand retard nécessite une justification obligatoire.");
        }

        // 6. Enregistrement en base de données
        return Attendance::create([
            'user_id' => $user->id,
            'check_in_time' => $now,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'status' => $attendanceData['status'],
            'late_minutes' => $attendanceData['late_minutes'],
            'justification' => $justification,
        ]);
    }

    /**
     * Calcule le statut du pointage selon les paliers de retard.
     */
    private function calculateStatusAndLateMinutes(Carbon $now, Carbon $openingTime): array
    {
        if ($now->lessThanOrEqualTo($openingTime)) {
            return [
                'status' => 'on_time',
                'late_minutes' => 0,
            ];
        }

        $lateMinutes = (int) $openingTime->diffInMinutes($now);

        if ($lateMinutes <= 15) {
            return [
                'status' => 'on_time',
                'late_minutes' => $lateMinutes,
            ];
        } elseif ($lateMinutes <= 60) {
            return [
                'status' => 'late',
                'late_minutes' => $lateMinutes,
            ];
        } else {
            return [
                'status' => 'very_late',
                'late_minutes' => $lateMinutes,
            ];
        }
    }
}