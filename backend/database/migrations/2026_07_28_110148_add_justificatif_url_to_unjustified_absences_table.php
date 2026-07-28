<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unjustified_absences', function (Blueprint $table) {
            $table->string('justificatif_url')->nullable()->after('explanation');
        });
    }

    public function down(): void
    {
        Schema::table('unjustified_absences', function (Blueprint $table) {
            $table->dropColumn('justificatif_url');
        });
    }
};