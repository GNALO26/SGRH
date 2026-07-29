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
     * Détecte les absences non justifiées d'un employé.
     *
     * @param User        $user    L'employé
     * @param Carbon|null $endDate Date de fin de la période à analyser (par défaut : hier)
     * @return bool True si au moins une absence a été créée
     */
    public function detectAndCreateAbsences(User $user, ?Carbon $endDate = null): bool
    {
        if ($user->role !== 'employee') {
            return false;
        }

        $endDate = $endDate ?? Carbon::yesterday();
        $endDate = $endDate->endOfDay(); // on prend la fin de la journée

        $lastLogin = $user->last_login_at
            ? Carbon::parse($user->last_login_at)->startOfDay()
            : Carbon::parse($user->created_at)->startOfDay();

        if ($lastLogin->greaterThanOrEqualTo(Carbon::today())) {
            Log::info("AbsenceService : {$user->name} – dernière connexion aujourd'hui.");
            return false;
        }

        if ($lastLogin->greaterThan($endDate)) {
            Log::info("AbsenceService : {$user->name} – période déjà couverte.");
            return false;
        }

        $missingDays = [];
        $period = CarbonPeriod::create($lastLogin, $endDate);

        foreach ($period as $date) {
            if ($date->isWeekend()) continue;
            if (Holiday::whereDate('date', $date)->exists()) continue;
            if (Attendance::where('user_id', $user->id)->whereDate('date', $date)->exists()) continue;
            if (Leave::where('user_id', $user->id)->where('status', 'approved')
                ->whereDate('start_date', '<=', $date)->whereDate('end_date', '>=', $date)->exists()) continue;

            $missingDays[] = $date->toDateString();
        }

        if (empty($missingDays)) {
            Log::info("AbsenceService : Aucun jour manquant pour {$user->name}.");
            return false;
        }

        $ranges = $this->groupConsecutiveDates($missingDays);
        $created = false;

        foreach ($ranges as $range) {
            $fromDate = Carbon::parse($range[0]);
            $toDate   = Carbon::parse(end($range));

            $exists = UnjustifiedAbsence::where('user_id', $user->id)
                ->where('from_date', $fromDate)
                ->where('to_date', $toDate)
                ->exists();

            if ($exists) continue;

            UnjustifiedAbsence::create([
                'user_id'   => $user->id,
                'from_date' => $fromDate,
                'to_date'   => $toDate,
                'status'    => 'pending',
            ]);
            Log::info("AbsenceService : Absence créée {$fromDate->toDateString()} → {$toDate->toDateString()}");
            $created = true;
        }

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

    private function groupConsecutiveDates(array $dates): array
    {
        if (empty($dates)) return [];
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