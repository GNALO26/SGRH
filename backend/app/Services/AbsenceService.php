<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\UnjustifiedAbsence;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Log;

class AbsenceService
{
    /**
     * Détecte les absences non justifiées depuis la dernière connexion de l'employé
     * et crée des entrées dans unjustified_absences si nécessaire.
     *
     * @param User $user L'employé concerné
     * @return bool True si au moins une absence a été créée
     */
    public function detectAndCreateAbsences(User $user): bool
    {
        if ($user->role !== 'employee') {
            return false;
        }

        // Date de début : dernière connexion ou création du compte
        $lastLogin = $user->last_login_at 
            ? Carbon::parse($user->last_login_at)->startOfDay() 
            : Carbon::parse($user->created_at)->startOfDay();

        // Date de fin : hier (on ne compte pas aujourd'hui)
        $endDate = Carbon::yesterday()->endOfDay();

        // Si la dernière connexion est aujourd'hui ou après, rien à faire
        if ($lastLogin->greaterThanOrEqualTo(Carbon::today())) {
            Log::info("AbsenceService : Aucune absence à détecter pour {$user->name} (dernière connexion aujourd'hui)");
            return false;
        }

        Log::info("AbsenceService : Détection pour {$user->name} du {$lastLogin->toDateString()} au {$endDate->toDateString()}");

        // Collecter les jours ouvrés manquants
        $missingDays = [];
        $period = CarbonPeriod::create($lastLogin, $endDate);

        foreach ($period as $date) {
            // Ignorer les week-ends
            if ($date->isWeekend()) {
                continue;
            }

            // Ignorer les jours fériés
            if (Holiday::whereDate('date', $date)->exists()) {
                continue;
            }

            // Ignorer si un pointage existe
            if (Attendance::where('user_id', $user->id)->whereDate('date', $date)->exists()) {
                continue;
            }

            // Ignorer si un congé approuvé couvre cette date
            if (Leave::where('user_id', $user->id)
                ->where('status', 'approved')
                ->whereDate('start_date', '<=', $date)
                ->whereDate('end_date', '>=', $date)
                ->exists()) {
                continue;
            }

            $missingDays[] = $date->toDateString();
        }

        if (empty($missingDays)) {
            Log::info("AbsenceService : Aucun jour manquant pour {$user->name}");
            return false;
        }

        // Regrouper en plages continues
        $ranges = $this->groupConsecutiveDates($missingDays);
        $created = false;

        foreach ($ranges as $range) {
            $fromDate = Carbon::parse($range[0]);
            $toDate   = Carbon::parse(end($range));

            // Éviter les doublons sur la même plage
            $exists = UnjustifiedAbsence::where('user_id', $user->id)
                ->where('from_date', $fromDate)
                ->where('to_date', $toDate)
                ->exists();

            if ($exists) {
                Log::info("AbsenceService : Plage déjà existante pour {$user->name} : {$fromDate->toDateString()} - {$toDate->toDateString()}");
                continue;
            }

            UnjustifiedAbsence::create([
                'user_id'   => $user->id,
                'from_date' => $fromDate,
                'to_date'   => $toDate,
                'status'    => 'pending',
            ]);

            Log::info("AbsenceService : Absence créée pour {$user->name} : {$fromDate->toDateString()} - {$toDate->toDateString()}");
            $created = true;
        }

        // Notification aux admins
        if ($created) {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                app(NotificationService::class)->createForUser(
                    $admin,
                    "Nouvelle absence non justifiée pour {$user->name}",
                    'fas fa-exclamation-triangle'
                );
            }
        }

        return $created;
    }

    /**
     * Regroupe une liste de dates consécutives en plages.
     */
    private function groupConsecutiveDates(array $dates): array
    {
        if (empty($dates)) {
            return [];
        }

        sort($dates);
        $ranges = [];
        $current = [$dates[0]];
        $prev = Carbon::parse($dates[0]);

        for ($i = 1; $i < count($dates); $i++) {
            $date = Carbon::parse($dates[$i]);
            if ($date->diffInDays($prev) === 1) {
                $current[] = $dates[$i];
            } else {
                $ranges[] = $current;
                $current = [$dates[$i]];
            }
            $prev = $date;
        }
        $ranges[] = $current;

        return $ranges;
    }
}