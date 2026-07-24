<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $notifications = request()->user()->notifications()
                ->orderByDesc('created_at')
                ->take(50)
                ->get();
            return response()->json($notifications);
        } catch (\Exception $e) {
            Log::error('Erreur notifications employee', ['error' => $e->getMessage()]);
            return response()->json([], 500);
        }
    }

    public function markAsRead(): JsonResponse
    {
        try {
            request()->user()->notifications()->where('read', false)->update(['read' => true]);
            return response()->json(['message' => 'Toutes les notifications sont marquées comme lues.']);
        } catch (\Exception $e) {
            Log::error('Erreur markAsRead notifications', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur'], 500);
        }
    }
}