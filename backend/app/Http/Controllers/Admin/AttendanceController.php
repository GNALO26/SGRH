<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with('user')
            ->when($request->date, fn($q) => $q->whereDate('date', $request->date))
            ->when($request->search, fn($q) => $q->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('email', 'like', '%'.$request->search.'%');
            }))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('date', 'desc')
            ->orderBy('check_in_time', 'desc');

        $attendances = $query->paginate(50);
        return response()->json($attendances);
    }
}