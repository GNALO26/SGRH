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
                'email' => env('ADMIN_EMAIL', 'alfredsossa17@gmail.com'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'SGRHpro2026JONAO')),
                'role' => 'admin',
            ]);
        }
    }
}