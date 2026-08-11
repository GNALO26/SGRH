<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'company_latitude',
        'company_longitude',
        'geofence_radius_meters',
        'official_opening_time',
        'official_closing_time',
        'base_salary',
        'matricule',
        'position',
        'department',
        'last_login_at',
        'avatar_url',
        'fcm_token',
        'two_factor_code',
        'two_factor_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'last_login_at'     => 'datetime',
            'two_factor_expires_at' => 'datetime',
        ];
    }

    public function attendances(): HasMany { return $this->hasMany(Attendance::class); }
    public function leaves(): HasMany { return $this->hasMany(Leave::class); }
    public function retardAuthorizations(): HasMany { return $this->hasMany(RetardAuthorization::class); }
    public function notifications(): HasMany { return $this->hasMany(Notification::class); }
    public function unjustifiedAbsences(): HasMany { return $this->hasMany(UnjustifiedAbsence::class); }
    public function assistanceRequests(): HasMany { return $this->hasMany(AssistanceRequest::class); }

    public function getCompanyLatAttribute(): ?float { return $this->company_latitude; }
    public function getCompanyLngAttribute(): ?float { return $this->company_longitude; }
}