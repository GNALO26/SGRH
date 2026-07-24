<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'check_in_time',
        'status',
        'late_minutes',
        'latitude',
        'longitude',
        'is_justified',
        'justification',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}