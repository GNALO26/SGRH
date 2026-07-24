<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class StatisticsController extends Controller
{
    public function monthlyLate(): JsonResponse
    {
        try {
            $labels = [];
            $values = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::today()->subMonths($i);
                $labels[] = $date->format('M Y');
                $values[] = Attendance::whereYear('date', $date->year)
                    ->whereMonth('date', $date->month)
                    ->sum('late_minutes');
            }
            return response()->json(['labels' => $labels, 'values' => $values]);
        } catch (\Exception $e) {
            Log::error('Erreur monthlyLate', ['error' => $e->getMessage()]);
            return response()->json(['labels' => [], 'values' => []], 500);
        }
    }

    public function topLate(): JsonResponse
    {
        try {
            $currentMonth = Carbon::today()->month;
            $top = Attendance::with('user')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', Carbon::today()->year)
                ->whereIn('status', ['late', 'major_late'])
                ->get()
                ->groupBy('user_id')
                ->map(function ($group) {
                    $user = $group->first()->user;
                    return [
                        'id'                => $user?->id,
                        'name'              => $user?->name ?? 'Utilisateur supprimé',
                        'total_late_minutes'=> $group->sum('late_minutes'),
                    ];
                })
                ->sortByDesc('total_late_minutes')
                ->take(5)
                ->values();
            return response()->json($top);
        } catch (\Exception $e) {
            Log::error('Erreur topLate', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }
}