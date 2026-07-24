<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;

class AdminNotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::whereHas('user', function ($q) {
            $q->where('role', 'admin');
        })
        ->orWhereNull('user_id')
        ->latest()
        ->take(50)
        ->get();

        return response()->json($notifications);
    }

    public function markAsRead()
    {
        Notification::whereHas('user', function ($q) {
            $q->where('role', 'admin');
        })->update(['read' => true]);

        return response()->json(['message' => 'Notifications marquées comme lues.']);
    }
}