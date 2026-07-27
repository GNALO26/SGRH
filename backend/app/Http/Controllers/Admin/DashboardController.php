<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $today = Carbon::today();
            $firstOfMonth = Carbon::today()->firstOfMonth();

            $totalEmployees = User::where('role', 'employee')->count();
            $presentToday   = Attendance::whereDate('date', $today)->count();
            $lateToday      = Attendance::whereDate('date', $today)
                ->whereIn('status', ['late', 'major_late'])->count();
            $approvedLeavesToday = Leave::where('status', 'approved')
                ->whereDate('start_date', '<=', $today)
                ->whereDate('end_date', '>=', $today)->count();
            $monthlyLateMinutes = Attendance::whereBetween('date', [$firstOfMonth, $today])
                ->sum('late_minutes');

            // Activités récentes
            $activities = ActivityLog::with('user')->latest()->take(10)
                ->get()->map(function ($log) {
                    return [
                        'id'     => $log->id,
                        'user'   => $log->user->name ?? 'Système',
                        'action' => $log->description,
                        'icon'   => $log->icon,
                        'time'   => $log->created_at->diffForHumans(),
                    ];
                });

            // Prochaines absences
            $upcomingLeaves = Leave::with('user')
                ->where('status', 'approved')
                ->where('start_date', '>', $today)
                ->orderBy('start_date')->take(5)
                ->get()->map(function ($leave) {
                    return [
                        'id'         => $leave->id,
                        'employee'   => $leave->user->name ?? 'Employé supprimé',
                        'type'       => $leave->type === 'vacation' ? 'Congé' : 'Absence',
                        'start_date' => $leave->start_date,
                        'end_date'   => $leave->end_date,
                    ];
                });

            // Historique absentéisme (30 jours)
            $absenceRateHistory = [];
            if ($totalEmployees > 0) {
                for ($i = 29; $i >= 0; $i--) {
                    $date = Carbon::today()->subDays($i);
                    $presentCount = Attendance::whereDate('date', $date)->count();
                    $rate = round((($totalEmployees - $presentCount) / $totalEmployees) * 100, 1);
                    $absenceRateHistory[] = [
                        'date' => $date->format('d/m'),
                        'rate' => $rate,
                    ];
                }
            }

            return response()->json([
                'stats' => [
                    'total_employees'       => $totalEmployees,
                    'present_today'         => $presentToday,
                    'late_today'            => $lateToday,
                    'approved_leaves_today' => $approvedLeavesToday,
                    'monthly_late_minutes'  => $monthlyLateMinutes,
                ],
                'activities'          => $activities,
                'upcoming_leaves'     => $upcomingLeaves,
                'absence_rate_history'=> $absenceRateHistory,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard admin - erreur', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Erreur interne du serveur.'], 500);
        }
    }
}