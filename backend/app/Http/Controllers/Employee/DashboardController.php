<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\RetardAuthorization;
use App\Models\UnjustifiedAbsence;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $employee = request()->user();
            if (!$employee) {
                return response()->json(['message' => 'Utilisateur non authentifié.'], 401);
            }

            $today = Carbon::today();
            $now   = Carbon::now();

            $admin = User::where('role', 'admin')->first();
            if (!$admin) {
                Log::warning('Dashboard employé : aucun admin trouvé');
                return response()->json(['message' => 'Aucun administrateur configuré.'], 500);
            }

            $openingTime = Carbon::createFromTimeString($admin->official_opening_time ?? '08:00');
            $closingTime = Carbon::createFromTimeString($admin->official_closing_time ?? '20:00');

            $startWindow = (clone $openingTime)->subHour();
            $endWindow   = (clone $closingTime)->subHours(3);
            if ($closingTime->lessThan($openingTime)) { $endWindow->addDay(); }
            $nowInWindow = $now->between($startWindow, $endWindow);

            $todayAttendance = Attendance::where('user_id', $employee->id)->whereDate('date', $today)->first();
            $leaveToday      = Leave::where('user_id', $employee->id)->where('status', 'approved')->whereDate('start_date', '<=', $today)->whereDate('end_date', '>=', $today)->exists();
            $canCheckIn      = !$todayAttendance && !$leaveToday && $nowInWindow;

            $month = (int) request('month', $today->month);
            $year  = (int) request('year', $today->year);
            $firstOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endOfMonth   = $firstOfMonth->copy()->endOfMonth();

            $pendingLeaves = Leave::where('user_id', $employee->id)->where('status', 'pending')->orderByDesc('created_at')->take(5)->get()->map(fn($l) => [
                'id' => $l->id, 'type' => 'leave', 'date' => ($l->start_date ?? '') . ' - ' . ($l->end_date ?? ''), 'reason' => $l->reason, 'statusClass' => 'bg-yellow-100 text-yellow-800', 'statusLabel' => 'En attente',
            ]);
            $pendingRetards = RetardAuthorization::where('user_id', $employee->id)->where('status', 'pending')->orderByDesc('created_at')->take(5)->get()->map(fn($r) => [
                'id' => $r->id, 'type' => 'retard', 'date' => ($r->date ?? '') . ' à ' . ($r->expected_arrival ?? ''), 'reason' => $r->reason, 'statusClass' => 'bg-yellow-100 text-yellow-800', 'statusLabel' => 'En attente',
            ]);
            $pendingRequests = $pendingLeaves->concat($pendingRetards)->values();

            $recentAttendances = Attendance::where('user_id', $employee->id)->orderByDesc('date')->take(5)->get()->map(function ($a) {
                switch ($a->status) {
                    case 'on_time': $c='bg-green-100 text-green-800'; $l='À l\'heure'; break;
                    case 'late': $c='bg-orange-100 text-orange-800'; $l='Retard'; break;
                    case 'major_late': $c='bg-red-100 text-red-800'; $l='Grand retard'; break;
                    case 'authorized': $c='bg-blue-100 text-blue-800'; $l='Autorisé'; break;
                    default: $c='bg-gray-100 text-gray-800'; $l='Inconnu';
                }
                return ['id'=>$a->id,'date'=>$a->date,'check_in_time'=>$a->check_in_time,'status'=>$a->status,'late_minutes'=>$a->late_minutes,'is_justified'=>$a->is_justified,'justification'=>$a->justification,'statusClass'=>$c,'statusLabel'=>$l];
            });

            $attendancesThisMonth = Attendance::where('user_id', $employee->id)->whereBetween('date', [$firstOfMonth, $endOfMonth])->get();
            $workedDays  = $attendancesThisMonth->count();
            $presentDays = $attendancesThisMonth->whereIn('status', ['on_time','late','major_late','authorized'])->count();
            $lateCount   = $attendancesThisMonth->whereIn('status', ['late','major_late'])->count();
            $lateMinutes = $attendancesThisMonth->sum('late_minutes');
            $absenceDays = Leave::where('user_id', $employee->id)->where('status','approved')->where('type','absence')->whereBetween('start_date',[$firstOfMonth,$endOfMonth])->count();

            $calendarEvents = [];
            foreach ($attendancesThisMonth as $att) {
                $calendarEvents[] = ['date' => $att->date, 'status' => in_array($att->status, ['late','major_late']) ? 'late' : 'present'];
            }
            $leavesThisMonth = Leave::where('user_id', $employee->id)->where('status','approved')->where(function($q) use ($firstOfMonth,$endOfMonth) {
                $q->whereBetween('start_date',[$firstOfMonth,$endOfMonth])->orWhereBetween('end_date',[$firstOfMonth,$endOfMonth]);
            })->get();
            foreach ($leavesThisMonth as $leave) {
                $start = max($leave->start_date, $firstOfMonth); $end = min($leave->end_date, $endOfMonth);
                try { foreach (CarbonPeriod::create($start, $end) as $date) { $calendarEvents[] = ['date' => $date->toDateString(), 'status' => 'leave']; } } catch (\Exception $e) {}
            }
            foreach (Holiday::whereBetween('date', [$firstOfMonth, $endOfMonth])->get() as $h) {
                $calendarEvents[] = ['date' => $h->date->toDateString(), 'status' => 'holiday'];
            }

            return response()->json([
                'today_attendance'   => $todayAttendance,
                'can_check_in'       => $canCheckIn,
                'leave_today'        => $leaveToday,
                'pending_requests'   => $pendingRequests,
                'recent_attendances' => $recentAttendances,
                'monthly_summary'    => ['worked_days'=>$workedDays,'present_days'=>$presentDays,'late_count'=>$lateCount,'late_minutes'=>$lateMinutes,'absence_days'=>$absenceDays],
                'calendar_events'    => $calendarEvents,
                'has_pending_absences' => UnjustifiedAbsence::where('user_id',$employee->id)->where('status','pending')->exists(),
                'upcoming_holidays'  => Holiday::where('date','>=',$today)->orderBy('date')->take(5)->get()->map(fn($h) => ['id'=>$h->id,'date'=>$h->date->toDateString(),'description'=>$h->description]),
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard employé - erreur', ['user_id'=>request()->user()?->id,'message'=>$e->getMessage(),'trace'=>$e->getTraceAsString()]);
            return response()->json(['message'=>'Erreur interne du serveur.','error'=>config('app.debug')?$e->getMessage():null], 500);
        }
    }
}