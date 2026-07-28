<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    protected $fillable = ['email', 'code', 'expires_at'];
    protected $primaryKey = 'email';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;
}