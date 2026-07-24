<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityService
{
    public function log(User $user, string $action, string $description, string $icon = 'fas fa-info-circle')
    {
        return ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'description' => $description,
            'icon' => $icon,
        ]);
    }
}