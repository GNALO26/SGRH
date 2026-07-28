<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Récupère les données du tableau de bord de l'employé
     * et évalue dynamiquement si le pointage est possible.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();
        $today = $now->toDateString();

        // 1. Récupération dynamique de la configuration entreprise (Admin)
        $admin = User::where('role', 'admin')->first();

        $openingStr = $admin?->official_opening_time ?? '08:00:00';
        $closingStr = $admin?->official_closing_time ?? '20:00:00';

        // 2. Ancrage des horaires sur la date du jour
        $openingTime = Carbon::parse($today . ' ' . $openingStr);
        $closingTime = Carbon::parse($today . ' ' . $closingStr);

        // 3. Gestion des shifts de nuit (ex: 23:00 -> 06:00)
        if ($closingTime->lessThanOrEqualTo($openingTime)) {
            if ($now->lessThanOrEqualTo($closingTime)) {
                $openingTime->subDay();
            } else {
                $closingTime->addDay();
            }
        }

        // 4. Fenêtre de pointage : -1h avant ouverture -> -3h avant fermeture
        $startWindow = (clone $openingTime)->subHour();
        $endWindow   = (clone $closingTime)->subHours(3);

        // 5. Vérification si déjà pointé aujourd'hui
        $alreadyCheckedIn = Attendance::where('user_id', $user->id)
            ->whereDate('check_in_time', $today)
            ->exists();

        // 6. Calcul de l'autorisation de pointage
        $canCheckIn = !$alreadyCheckedIn && $now->between($startWindow, $endWindow);

        // 7. Dernier pointage de l'utilisateur
        $latestAttendance = Attendance::where('user_id', $user->id)
            ->latest('check_in_time')
            ->first();

        return response()->json([
            'success' => true,
            'can_check_in' => $canCheckIn,
            'already_checked_in' => $alreadyCheckedIn,
            'official_opening_time' => $openingStr,
            'official_closing_time' => $closingStr,
            'window_start' => $startWindow->toIso8601String(),
            'window_end' => $endWindow->toIso8601String(),
            'server_now' => $now->toIso8601String(),
            'latest_attendance' => $latestAttendance,
            'company_location' => [
                'latitude' => $admin?->company_latitude,
                'longitude' => $admin?->company_longitude,
                'geofence_radius' => $admin?->geofence_radius_meters ?? 100,
            ],
        ]);
    }
}