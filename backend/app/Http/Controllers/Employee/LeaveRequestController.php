<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index()
    {
        $leaves = request()->user()->leaves()->latest()->get();
        return response()->json($leaves);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'type'       => 'required|in:absence,vacation',
            'reason'     => 'required|string|max:1000',
        ]);

        $leave = $request->user()->leaves()->create($validated);

        try {
            $employee = $request->user();
            $this->notificationService->createForAdmins(
                "Nouvelle demande de {$validated['type']} de {$employee->name}",
                'fas fa-calendar-plus',
                '/admin/conges'
            );
        } catch (\Exception $e) {
            report($e);
        }

        return response()->json($leave, 201);
    }

    public function destroy(Leave $leave)
    {
        if ($leave->user_id !== request()->user()->id) abort(403);
        $leave->delete();
        return response()->json(null, 204);
    }
}