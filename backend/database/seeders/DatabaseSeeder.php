<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (User::count() === 0) {
            User::create([
                'name' => 'Administrateur',
                'email' => env('ADMIN_EMAIL', 'admin@sgrh.com'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'Admin1234!')),
                'role' => 'admin',
            ]);
        }
    }
}