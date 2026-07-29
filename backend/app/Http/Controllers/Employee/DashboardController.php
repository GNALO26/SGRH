<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\RetardAuthorization;
use App\Models\UnjustifiedAbsence;
use App\Models\User;
use App\Services\AbsenceService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Tableau de bord principal de l'employé.
     */
    public function index(): JsonResponse
    {
        try {
            $employee = request()->user();
            if (!$employee) {
                return response()->json(['message' => 'Utilisateur non authentifié.'], 401);
            }

            // ===== DÉTECTION DES ABSENCES NON JUSTIFIÉES =====
            try {
                app(AbsenceService::class)->detectAndCreateAbsences($employee);
            } catch (\Exception $e) {
                Log::error('Erreur détection absences', ['user_id' => $employee->id, 'error' => $e->getMessage()]);
            }

            $today = Carbon::today();
            $now   = Carbon::now();

            // --- Paramètres admin (horaires dynamiques) ---
            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                Log::warning('Dashboard employé : aucun administrateur trouvé.');
                return response()->json(['message' => 'Aucun administrateur configuré.'], 500);
            }

            $openingTime = Carbon::createFromTimeString($admin->official_opening_time ?? '08:00');
            $closingTime = Carbon::createFromTimeString($admin->official_closing_time ?? '20:00');

            // Fenêtre de pointage : 1h avant ouverture → 3h avant fermeture
            $startWindow = (clone $openingTime)->subHour();
            $endWindow   = (clone $closingTime)->subHours(3);

            // Gestion du shift de nuit (ex: 23:00 - 06:00)
            if ($closingTime->lessThan($openingTime)) {
                $endWindow->addDay();
            }

            $nowInWindow = $now->between($startWindow, $endWindow);

            // --- Pointage du jour ---
            $todayAttendance = Attendance::where('user_id', $employee->id)
                ->whereDate('date', $today)
                ->first();

            $leaveToday = Leave::where('user_id', $employee->id)
                ->where('status', 'approved')
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)
                ->exists();

            $canCheckIn = !$todayAttendance && !$leaveToday && $nowInWindow;

            // --- Mois sélectionné ---
            $month = (int) request('month', $today->month);
            $year  = (int) request('year', $today->year);
            $firstOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endOfMonth   = $firstOfMonth->copy()->endOfMonth();

            // --- Demandes en attente ---
            $pendingLeaves = Leave::where('user_id', $employee->id)
                ->where('status', 'pending')
                ->orderByDesc('created_at')
                ->take(5)
                ->get()
                ->map(fn($l) => [
                    'id'          => $l->id,
                    'type'        => 'leave',
                    'date'        => ($l->start_date ?? '') . ' - ' . ($l->end_date ?? ''),
                    'reason'      => $l->reason,
                    'statusClass' => 'bg-yellow-100 text-yellow-800',
                    'statusLabel' => 'En attente',
                ]);

            $pendingRetards = RetardAuthorization::where('user_id', $employee->id)
                ->where('status', 'pending')
                ->orderByDesc('created_at')
                ->take(5)
                ->get()
                ->map(fn($r) => [
                    'id'          => $r->id,
                    'type'        => 'retard',
                    'date'        => ($r->date ?? '') . ' à ' . ($r->expected_arrival ?? ''),
                    'reason'      => $r->reason,
                    'statusClass' => 'bg-yellow-100 text-yellow-800',
                    'statusLabel' => 'En attente',
                ]);

            $pendingRequests = $pendingLeaves->concat($pendingRetards)->sortByDesc('created_at')->values();

            // --- Derniers pointages (5) ---
            $recentAttendances = Attendance::where('user_id', $employee->id)
                ->orderByDesc('date')
                ->take(5)
                ->get()
                ->map(function ($a) {
                    switch ($a->status) {
                        case 'on_time':    $cls = 'bg-green-100 text-green-800'; $lbl = 'À l\'heure'; break;
                        case 'late':       $cls = 'bg-orange-100 text-orange-800'; $lbl = 'Retard'; break;
                        case 'major_late': $cls = 'bg-red-100 text-red-800'; $lbl = 'Grand retard'; break;
                        case 'authorized': $cls = 'bg-blue-100 text-blue-800'; $lbl = 'Autorisé'; break;
                        default:           $cls = 'bg-gray-100 text-gray-800'; $lbl = 'Inconnu';
                    }
                    return [
                        'id'            => $a->id,
                        'date'          => $a->date,
                        'check_in_time' => $a->check_in_time,
                        'status'        => $a->status,
                        'late_minutes'  => $a->late_minutes,
                        'is_justified'  => $a->is_justified,
                        'justification' => $a->justification,
                        'statusClass'   => $cls,
                        'statusLabel'   => $lbl,
                    ];
                });

            // --- Résumé mensuel ---
            $attendancesThisMonth = Attendance::where('user_id', $employee->id)
                ->whereBetween('date', [$firstOfMonth, $endOfMonth])
                ->get();

            $workedDays   = $attendancesThisMonth->count();
            $presentDays  = $attendancesThisMonth->whereIn('status', ['on_time','late','major_late','authorized'])->count();
            $lateCount    = $attendancesThisMonth->whereIn('status', ['late','major_late'])->count();
            $lateMinutes  = $attendancesThisMonth->sum('late_minutes');
            $absenceDays  = Leave::where('user_id', $employee->id)
                ->where('status', 'approved')
                ->where('type', 'absence')
                ->whereBetween('start_date', [$firstOfMonth, $endOfMonth])
                ->count();

            // --- Événements calendrier (mois courant uniquement pour le résumé) ---
            $calendarEvents = []; // sera chargé par /calendar-events

            $hasPendingAbsences = UnjustifiedAbsence::where('user_id', $employee->id)
                ->where('status', 'pending')
                ->exists();

            return response()->json([
                'today_attendance'   => $todayAttendance,
                'can_check_in'       => $canCheckIn,
                'leave_today'        => $leaveToday,
                'pending_requests'   => $pendingRequests,
                'recent_attendances' => $recentAttendances,
                'monthly_summary'    => [
                    'worked_days'  => $workedDays,
                    'present_days' => $presentDays,
                    'late_count'   => $lateCount,
                    'late_minutes' => $lateMinutes,
                    'absence_days' => $absenceDays,
                ],
                'calendar_events'    => $calendarEvents, // vide ou inchangé pour compatibilité
                'has_pending_absences' => $hasPendingAbsences,
                'upcoming_holidays'  => [], // sera chargé par /calendar-events
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard employé - erreur', [
                'user_id' => request()->user()?->id,
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Erreur interne du serveur.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Nouvel endpoint pour les événements du calendrier (appelé séparément par le frontend).
     */
    public function calendarEvents(Request $request): JsonResponse
    {
        try {
            $employee = $request->user();
            if (!$employee) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }

            $month = (int) $request->input('month', Carbon::today()->month);
            $year  = (int) $request->input('year', Carbon::today()->year);

            $firstOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endOfMonth   = $firstOfMonth->copy()->endOfMonth();

            // Présences du mois
            $attendances = Attendance::where('user_id', $employee->id)
                ->whereBetween('date', [$firstOfMonth, $endOfMonth])
                ->get();

            $calendarEvents = [];
            foreach ($attendances as $att) {
                $status = in_array($att->status, ['late','major_late']) ? 'late' : 'present';
                $calendarEvents[] = ['date' => $att->date->toDateString(), 'status' => $status];
            }

            // Congés validés
            $leaves = Leave::where('user_id', $employee->id)
                ->where('status', 'approved')
                ->where(function ($q) use ($firstOfMonth, $endOfMonth) {
                    $q->whereBetween('start_date', [$firstOfMonth, $endOfMonth])
                      ->orWhereBetween('end_date', [$firstOfMonth, $endOfMonth]);
                })->get();

            foreach ($leaves as $leave) {
                $start = max($leave->start_date, $firstOfMonth);
                $end   = min($leave->end_date, $endOfMonth);
                try {
                    $period = CarbonPeriod::create($start, $end);
                    foreach ($period as $date) {
                        $calendarEvents[] = ['date' => $date->toDateString(), 'status' => 'leave'];
                    }
                } catch (\Exception $e) {
                    Log::error('Erreur période calendrier', ['msg' => $e->getMessage()]);
                }
            }

            // Jours fériés du mois
            $holidays = Holiday::whereBetween('date', [$firstOfMonth, $endOfMonth])->get();
            foreach ($holidays as $holiday) {
                $calendarEvents[] = ['date' => $holiday->date->toDateString(), 'status' => 'holiday'];
            }

            // Prochains jours fériés (hors mois courant)
            $upcomingHolidays = Holiday::where('date', '>=', Carbon::today())
                ->orderBy('date')
                ->take(5)
                ->get()
                ->map(fn($h) => [
                    'id'          => $h->id,
                    'date'        => $h->date->toDateString(),
                    'description' => $h->description,
                ]);

            return response()->json([
                'calendar_events' => $calendarEvents,
                'upcoming_holidays' => $upcomingHolidays,
            ]);
        } catch (\Exception $e) {
            Log::error('Calendar events - erreur', [
                'user_id' => $request->user()?->id,
                'message' => $e->getMessage(),
            ]);
            return response()->json([
                'calendar_events' => [],
                'upcoming_holidays' => [],
            ], 500);
        }
    }
}