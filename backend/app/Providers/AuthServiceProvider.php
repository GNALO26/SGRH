<?php

namespace App\Providers;

use App\Models\Attendance;
use App\Policies\AttendancePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Attendance::class => AttendancePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}