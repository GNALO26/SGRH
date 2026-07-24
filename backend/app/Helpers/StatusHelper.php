<?php

namespace App\Helpers;

class StatusHelper
{
    public function traduire($status)
    {
        return match($status) {
            'on_time' => "À l'heure",
            'late' => 'Retard',
            'major_late' => 'Grand retard',
            'authorized' => 'Autorisé',
            default => $status,
        };
    }
}