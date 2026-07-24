<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\UnjustifiedAbsence;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();
        $month = Carbon::now()->month;

        $totalEmployees = User::where('role', 'employee')->count();
        $presentCount = Attendance::whereDate('date', $today)->count();
        $lateCount = Attendance::whereDate('date', $today)
            ->whereIn('status', ['late', 'major_late'])->count();
        $leavesApprovedToday = Leave::where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)->count();

        $monthlyLateMinutes = Attendance::whereMonth('date', $month)
            ->whereYear('date', $today->year)->sum('late_minutes');

        $pendingAbsencesCount = UnjustifiedAbsence::where('status', 'pending')->count();

        $activities = [];
        $recentAttendances = Attendance::with('user')->latest()->take(10)->get();
        foreach ($recentAttendances as $att) {
            $activities[] = [
                'id'     => 'att_'.$att->id,
                'user'   => $att->user?->name ?? 'Utilisateur supprimé',
                'action' => 'a pointé son arrivée',
                'time'   => $att->created_at->diffForHumans(),
                'icon'   => 'fas fa-fingerprint',
            ];
        }

        $upcomingLeaves = Leave::with('user')
            ->where('status', 'approved')
            ->where('start_date', '>', $today)
            ->orderBy('start_date')->take(5)->get()
            ->map(fn($l) => [
                'id'         => $l->id,
                'employee'   => $l->user->name,
                'type'       => $l->type,
                'start_date' => $l->start_date->toDateString(),
                'end_date'   => $l->end_date->toDateString(),
            ]);

        $history = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $totalEmp = User::where('role', 'employee')->count();
            $absences = Leave::where('status', 'approved')
                ->whereDate('start_date', '<=', $date)
                ->whereDate('end_date', '>=', $date)->count();
            $rate = $totalEmp > 0 ? round(($absences / $totalEmp) * 100, 2) : 0;
            $history[] = ['date' => $date->format('d/m'), 'rate' => $rate];
        }

        return response()->json([
            'stats' => [
                'total_employees'        => $totalEmployees,
                'present_today'          => $presentCount,
                'late_today'             => $lateCount,
                'approved_leaves_today'  => $leavesApprovedToday,
                'monthly_late_minutes'   => $monthlyLateMinutes,
                'pending_absences_count' => $pendingAbsencesCount,
            ],
            'activities'          => $activities,
            'upcoming_leaves'     => $upcomingLeaves,
            'absence_rate_history'=> $history,
        ]);
    }
}