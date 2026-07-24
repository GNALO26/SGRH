<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function createForUser(User $user, string $message, string $icon = 'fas fa-info-circle', ?string $time = null)
    {
        return Notification::create([
            'user_id' => $user->id,
            'icon' => $icon,
            'message' => $message,
            'time' => $time ?? now()->diffForHumans(),
        ]);
    }

    public function createForAdmins(string $message, string $icon = 'fas fa-info-circle')
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $this->createForUser($admin, $message, $icon);
        }
    }
}