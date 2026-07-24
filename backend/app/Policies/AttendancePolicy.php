<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'employee';
    }

    public function update(User $user, Attendance $attendance): bool
    {
        return false; // Personne ne peut modifier un pointage
    }
}