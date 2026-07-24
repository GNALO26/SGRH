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
    public function detectAndCreateAbsences(User $user): bool
    {
        $lastLogin = $user->last_login_at ?? $user->created_at;
        $startDate = Carbon::parse($lastLogin)->startOfDay();
        $endDate = Carbon::today()->subDay(); // jusqu'à hier

        if ($startDate->greaterThanOrEqualTo($endDate)) {
            return false;
        }

        $period = CarbonPeriod::create($startDate, $endDate);
        $missingDays = [];

        foreach ($period as $date) {
            if ($date->isWeekend()) continue;

            // Vérifier si jour férié
            if (Holiday::whereDate('date', $date)->exists()) continue;

            // Vérifier si pointage
            if (Attendance::where('user_id', $user->id)->whereDate('date', $date)->exists()) continue;

            // Vérifier si congé validé
            if (Leave::where('user_id', $user->id)
                ->where('status', 'approved')
                ->whereDate('start_date', '<=', $date)
                ->whereDate('end_date', '>=', $date)
                ->exists()) continue;

            $missingDays[] = $date->toDateString();
        }

        if (empty($missingDays)) return false;

        // Regrouper en plages continues
        $ranges = $this->groupConsecutiveDates($missingDays);
        $created = false;

        foreach ($ranges as $range) {
            // Éviter doublon sur la même plage
            $exists = UnjustifiedAbsence::where('user_id', $user->id)
                ->where('from_date', $range[0])
                ->where('to_date', end($range))
                ->exists();
            if ($exists) continue;

            UnjustifiedAbsence::create([
                'user_id' => $user->id,
                'from_date' => $range[0],
                'to_date' => end($range),
                'status' => 'pending',
            ]);
            $created = true;
        }

        if ($created) {
            // Notification aux admins
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
        $ranges = [];
        $current = [];
        $prev = null;

        foreach ($dates as $date) {
            if ($prev && Carbon::parse($date)->diffInDays(Carbon::parse($prev)) > 1) {
                $ranges[] = $current;
                $current = [];
            }
            $current[] = $date;
            $prev = $date;
        }
        if (!empty($current)) $ranges[] = $current;
        return $ranges;
    }
}