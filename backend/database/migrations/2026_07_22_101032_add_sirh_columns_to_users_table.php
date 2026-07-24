<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'employee'])->default('employee');
            $table->decimal('company_latitude', 10, 7)->nullable();
            $table->decimal('company_longitude', 10, 7)->nullable();
            $table->integer('geofence_radius_meters')->default(50);
            $table->time('official_opening_time')->default('08:00:00');
            $table->decimal('base_salary', 10, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'company_latitude',
                'company_longitude',
                'geofence_radius_meters',
                'official_opening_time',
                'base_salary',
            ]);
        });
    }
};