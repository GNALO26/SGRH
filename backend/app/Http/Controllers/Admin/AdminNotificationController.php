<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;

class AdminNotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = Notification::whereIn('user_id', function ($query) {
            $query->select('id')->from('users')->where('role', 'admin');
        })->orWhereNull('user_id')
          ->orderByDesc('created_at')
          ->take(50)
          ->get();

        return response()->json($notifications);
    }

    public function markAsRead(): JsonResponse
    {
        Notification::whereIn('user_id', function ($query) {
            $query->select('id')->from('users')->where('role', 'admin');
        })->where('read', false)
          ->update(['read' => true]);

        return response()->json(['message' => 'Notifications marquées comme lues.']);
    }
}