<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\RetardAuthorization;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class RetardAuthorizationController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index()
    {
        $authorizations = request()->user()->retardAuthorizations()->latest()->get();
        return response()->json($authorizations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'             => 'required|date|after_or_equal:today',
            'expected_arrival' => 'required|date_format:H:i',
            'reason'           => 'required|string|max:1000',
        ]);

        $auth = $request->user()->retardAuthorizations()->create($validated);

        try {
            $employee = $request->user();
            $this->notificationService->createForAdmins(
                "Nouvelle autorisation de retard de {$employee->name} pour le {$validated['date']}",
                'fas fa-clock',
                '/admin/autorisations'
            );
        } catch (\Exception $e) {
            report($e);
        }

        return response()->json($auth, 201);
    }

    public function destroy(RetardAuthorization $retardAuthorization)
    {
        if ($retardAuthorization->user_id !== request()->user()->id) abort(403);
        $retardAuthorization->delete();
        return response()->json(null, 204);
    }
}