<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Leave;
use App\Models\RetardAuthorization;
use App\Models\User;
use Carbon\Carbon;

class AttendanceService
{
    public function attemptCheckIn(User $employee, float $latitude, float $longitude, ?string $justification = null): array
    {
        $now = Carbon::now();
        $today = $now->toDateString();

        $hasApprovedLeave = Leave::where('user_id', $employee->id)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->exists();
        if ($hasApprovedLeave) {
            return [
                'success' => false,
                'message' => 'Pointage impossible : vous êtes en absence autorisée aujourd\'hui.',
                'status_code' => 403,
            ];
        }

        $geoService = new GeoFencingService();
        if (! $geoService->isEmployeeAtOffice($employee, $latitude, $longitude)) {
            return [
                'success' => false,
                'message' => 'Erreur : Vous devez être présent dans les locaux de l\'entreprise pour pointer.',
                'status_code' => 403,
            ];
        }

        $alreadyCheckedIn = Attendance::where('user_id', $employee->id)
            ->whereDate('date', $today)->exists();
        if ($alreadyCheckedIn) {
            return [
                'success' => false,
                'message' => 'Vous avez déjà pointé aujourd\'hui.',
                'status_code' => 409,
            ];
        }

        $admin = User::where('role', 'admin')->firstOrFail();
        $openingTime = Carbon::createFromTimeString($admin->official_opening_time);
        $deadlineLate = (clone $openingTime)->addHour();

        $minTime = Carbon::createFromTime(6, 30, 0);
        if ($now->lt($minTime)) {
            return [
                'success' => false,
                'message' => 'Le pointage n\'est pas ouvert avant 06:30.',
                'status_code' => 403,
            ];
        }

        $status = '';
        $lateMinutes = 0;
        $isJustified = false;

        if ($now->lt($openingTime)) {
            $status = 'on_time';
        } elseif ($now->gte($openingTime) && $now->lte($deadlineLate)) {
            $status = 'late';
            $lateMinutes = (int) $openingTime->diffInMinutes($now);
        } else {
            $retardAuth = RetardAuthorization::where('user_id', $employee->id)
                ->where('status', 'approved')
                ->whereDate('date', $today)->first();

            if ($retardAuth) {
                $status = 'authorized';
                $lateMinutes = (int) $openingTime->diffInMinutes($now);
            } else {
                if (empty($justification)) {
                    return [
                        'success' => false,
                        'message' => 'Grand retard détecté. Merci de fournir une justification.',
                        'requires_justification' => true,
                        'status_code' => 400,
                    ];
                }
                $status = 'major_late';
                $lateMinutes = (int) $openingTime->diffInMinutes($now);
                $isJustified = true;
            }
        }

        $attendance = Attendance::create([
            'user_id'       => $employee->id,
            'date'          => $today,
            'check_in_time' => $now->toTimeString(),
            'status'        => $status,
            'late_minutes'  => $lateMinutes,
            'latitude'      => $latitude,
            'longitude'     => $longitude,
            'is_justified'  => $isJustified,
            'justification' => $justification,
        ]);

        return [
            'success'    => true,
            'attendance' => $attendance,
            'status_code'=> 201,
        ];
    }
}