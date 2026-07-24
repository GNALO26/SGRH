<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\RetardAuthorization;
use App\Models\UnjustifiedAbsence;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $employee = request()->user();
        $today = Carbon::today();
        $now = Carbon::now();

        // Mois demandé (par défaut mois courant)
        $month = (int) request('month', $today->month);
        $year = (int) request('year', $today->year);
        $firstOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endOfMonth = $firstOfMonth->copy()->endOfMonth();

        $todayAttendance = Attendance::where('user_id', $employee->id)
            ->whereDate('date', $today)->first();

        $leaveToday = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->exists();

        $canCheckIn = !$todayAttendance && !$leaveToday;
        $minTime = Carbon::createFromTime(6, 30);
        $maxTime = Carbon::createFromTime(20, 0);
        if ($now->lt($minTime) || $now->gt($maxTime)) {
            $canCheckIn = false;
        }

        // Demandes en attente (toujours basées sur aujourd'hui)
        $pendingLeaves = Leave::where('user_id', $employee->id)
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->take(5)->get()
            ->map(fn($l) => [
                'id' => $l->id,
                'type' => 'leave',
                'date' => $l->start_date . ' - ' . $l->end_date,
                'reason' => $l->reason,
                'statusClass' => 'bg-yellow-100 text-yellow-800',
                'statusLabel' => 'En attente',
            ]);

        $pendingRetards = RetardAuthorization::where('user_id', $employee->id)
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->take(5)->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'type' => 'retard',
                'date' => $r->date . ' à ' . $r->expected_arrival,
                'reason' => $r->reason,
                'statusClass' => 'bg-yellow-100 text-yellow-800',
                'statusLabel' => 'En attente',
            ]);

        $pendingRequests = $pendingLeaves->concat($pendingRetards)->sortByDesc('created_at')->values();

        // Derniers pointages (5)
        $recentAttendances = Attendance::where('user_id', $employee->id)
            ->orderByDesc('date')
            ->take(5)->get()
            ->map(function ($a) {
                $statusClass = 'bg-gray-100 text-gray-800';
                $statusLabel = 'Inconnu';
                switch ($a->status) {
                    case 'on_time': $statusClass = 'bg-green-100 text-green-800'; $statusLabel = 'À l\'heure'; break;
                    case 'late': $statusClass = 'bg-orange-100 text-orange-800'; $statusLabel = 'Retard'; break;
                    case 'major_late': $statusClass = 'bg-red-100 text-red-800'; $statusLabel = 'Grand retard'; break;
                    case 'authorized': $statusClass = 'bg-blue-100 text-blue-800'; $statusLabel = 'Autorisé'; break;
                }
                return array_merge($a->toArray(), ['statusClass' => $statusClass, 'statusLabel' => $statusLabel]);
            });

        // Résumé mensuel (mois sélectionné)
        $attendancesThisMonth = Attendance::where('user_id', $employee->id)
            ->whereBetween('date', [$firstOfMonth, $endOfMonth])
            ->get();
        $workedDays = $attendancesThisMonth->count();
        $presentDays = $attendancesThisMonth->whereIn('status', ['on_time','late','major_late','authorized'])->count();
        $lateCount = $attendancesThisMonth->whereIn('status', ['late','major_late'])->count();
        $lateMinutes = $attendancesThisMonth->sum('late_minutes');
        $absenceDays = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->where('type', 'absence')
            ->whereBetween('start_date', [$firstOfMonth, $endOfMonth])
            ->count();

        // Événements calendrier du mois sélectionné
        $calendarEvents = [];
        foreach ($attendancesThisMonth as $att) {
            $status = in_array($att->status, ['late','major_late']) ? 'late' : 'present';
            $calendarEvents[] = ['date' => $att->date, 'status' => $status];
        }
        $leavesThisMonth = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->where(function ($q) use ($firstOfMonth, $endOfMonth) {
                $q->whereBetween('start_date', [$firstOfMonth, $endOfMonth])
                  ->orWhereBetween('end_date', [$firstOfMonth, $endOfMonth]);
            })->get();
        foreach ($leavesThisMonth as $leave) {
            $start = max($leave->start_date, $firstOfMonth);
            $end = min($leave->end_date, $endOfMonth);
            try {
                $period = CarbonPeriod::create($start, $end);
                foreach ($period as $date) {
                    $calendarEvents[] = ['date' => $date->toDateString(), 'status' => 'leave'];
                }
            } catch (\Exception $e) {}
        }
        $holidaysMonth = Holiday::whereBetween('date', [$firstOfMonth, $endOfMonth])->get();
        foreach ($holidaysMonth as $holiday) {
            $calendarEvents[] = ['date' => $holiday->date->toDateString(), 'status' => 'holiday'];
        }

        $hasPendingAbsences = UnjustifiedAbsence::where('user_id', $employee->id)
            ->where('status', 'pending')->exists();

        $upcomingHolidays = Holiday::where('date', '>=', $today)->orderBy('date')->take(5)->get()
            ->map(fn($h) => ['id' => $h->id, 'date' => $h->date->toDateString(), 'description' => $h->description]);

        $upcomingLeaves = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->where('start_date', '>', $today)
            ->orderBy('start_date')->take(5)->get()
            ->map(fn($l) => [
                'id' => $l->id,
                'type_label' => $l->type === 'vacation' ? 'Congé' : 'Absence',
                'start_date' => $l->start_date->toDateString(),
                'end_date' => $l->end_date->toDateString(),
            ]);

        return response()->json([
            'today_attendance' => $todayAttendance,
            'can_check_in' => $canCheckIn,
            'leave_today' => $leaveToday,
            'pending_requests' => $pendingRequests,
            'recent_attendances' => $recentAttendances,
            'monthly_summary' => [
                'worked_days' => $workedDays,
                'present_days' => $presentDays,
                'late_count' => $lateCount,
                'late_minutes' => $lateMinutes,
                'absence_days' => $absenceDays,
            ],
            'calendar_events' => $calendarEvents,
            'has_pending_absences' => $hasPendingAbsences,
            'upcoming_holidays' => $upcomingHolidays,
            'upcoming_leaves' => $upcomingLeaves,
        ]);
    }
}