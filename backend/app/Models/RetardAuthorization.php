<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RetardAuthorization extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'expected_arrival',
        'reason',
        'status',
        'approved_by',
    ];

    protected $casts = [
        'date' => 'date',
        // 'expected_arrival' => 'datetime', // ← SUPPRIMÉ, car expected_arrival est un time string, pas un datetime
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}