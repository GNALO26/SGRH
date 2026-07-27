<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\RetardAuthorization;
use App\Models\User;
use Carbon\Carbon;

class AttendanceService
{
    public function __construct(private GeoFencingService $geoFencingService) {}

    public function attemptCheckIn(User $employee, float $latitude, float $longitude, ?string $justification = null): array
    {
        $now = Carbon::now();
        $today = $now->toDateString();

        // 1. Absence autorisée aujourd'hui ?
        $hasApprovedLeave = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->exists();
        if ($hasApprovedLeave) {
            return [
                'success' => false,
                'message' => 'Pointage impossible : vous êtes en absence autorisée aujourd\'hui.',
                'status_code' => 403,
            ];
        }

        // 2. Géolocalisation
        try {
            $isAtOffice = $this->geoFencingService->isEmployeeAtOffice($employee, $latitude, $longitude);
        } catch (\RuntimeException $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'status_code' => 400,
            ];
        }
        if (! $isAtOffice) {
            return [
                'success' => false,
                'message' => 'Erreur : Vous devez être présent dans les locaux de l\'entreprise pour pointer.',
                'status_code' => 403,
            ];
        }

        // 3. Un seul pointage par jour
        $alreadyCheckedIn = Attendance::where('user_id', $employee->id)
            ->whereDate('date', $today)->exists();
        if ($alreadyCheckedIn) {
            return [
                'success' => false,
                'message' => 'Vous avez déjà pointé aujourd\'hui.',
                'status_code' => 409,
            ];
        }

        // 4. Paramètres de l'entreprise
        $admin = User::where('role', 'admin')->firstOrFail();
        $openingTime = Carbon::createFromTimeString($admin->official_opening_time);
        $closingTime = Carbon::createFromTimeString($admin->official_closing_time ?? '20:00');

        // Fenêtre de pointage : 1h avant ouverture jusqu'à 3h avant fermeture
        $startWindow = (clone $openingTime)->subHour();   // ex: 07:00 si ouverture à 08:00
        $endWindow = (clone $closingTime)->subHours(3);   // ex: 15:00 si fermeture à 18:00

        if ($now->lt($startWindow)) {
            return [
                'success' => false,
                'message' => 'Le pointage n\'est pas encore ouvert. Revenez à partir de ' . $startWindow->format('H:i') . '.',
                'status_code' => 403,
            ];
        }
        if ($now->gt($endWindow)) {
            return [
                'success' => false,
                'message' => 'Le pointage est fermé pour aujourd\'hui. Vous pourrez pointer demain à partir de ' . $startWindow->format('H:i') . '.',
                'status_code' => 403,
            ];
        }

        // 5. Paliers horaires (basés sur l'heure d'ouverture)
        $deadlineLate = (clone $openingTime)->addHour();   // 1h de retard standard

        $status = '';
        $lateMinutes = 0;
        $isJustified = false;

        if ($now->lt($openingTime)) {
            $status = 'on_time';   // avant l'heure d'ouverture
        } elseif ($now->gte($openingTime) && $now->lte($deadlineLate)) {
            $status = 'late';      // retard standard
            $lateMinutes = (int) $openingTime->diffInMinutes($now);
        } else {
            // Grand retard (après ouverture + 1h)
            $retardAuth = RetardAuthorization::where('user_id', $employee->id)
                ->where('status', 'approved')
                ->whereDate('date', $today)->first();

            if ($retardAuth) {
                $status = 'authorized';
                $lateMinutes = (int) $openingTime->diffInMinutes($now);
            } else {
                if (empty($justification)) {
                    return [
                        'success' => false,
                        'message' => 'Grand retard détecté. Merci de fournir une justification.',
                        'requires_justification' => true,
                        'status_code' => 400,
                    ];
                }
                $status = 'major_late';
                $lateMinutes = (int) $openingTime->diffInMinutes($now);
                $isJustified = true;
            }
        }

        // Création du pointage
        $attendance = Attendance::create([
            'user_id'       => $employee->id,
            'date'          => $today,
            'check_in_time' => $now->toTimeString(),
            'status'        => $status,
            'late_minutes'  => $lateMinutes,
            'latitude'      => $latitude,
            'longitude'     => $longitude,
            'is_justified'  => $isJustified,
            'justification' => $justification,
        ]);

        return [
            'success'    => true,
            'attendance' => $attendance,
            'status_code'=> 201,
        ];
    }
}