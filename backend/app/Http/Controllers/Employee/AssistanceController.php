<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AssistanceController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index()
    {
        return response()->json(
            request()->user()->assistanceRequests()->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject'     => 'required|string|max:255',
            'description' => 'required|string|max:2000',
        ]);

        $req = $request->user()->assistanceRequests()->create($validated);

        try {
            $this->notificationService->createForAdmins(
                "Nouvelle demande d'assistance de {$req->user->name}",
                'fas fa-life-ring',
                '/admin/assistance'
            );
        } catch (\Exception $e) {
            report($e);
        }

        return response()->json($req, 201);
    }
}