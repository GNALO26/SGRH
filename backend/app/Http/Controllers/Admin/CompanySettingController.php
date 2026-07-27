<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanySettingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $admin = $request->user();
        return response()->json([
            'company_latitude'       => $admin->company_latitude,
            'company_longitude'      => $admin->company_longitude,
            'geofence_radius_meters' => $admin->geofence_radius_meters,
            'official_opening_time'  => $admin->official_opening_time,
            'official_closing_time'  => $admin->official_closing_time,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'company_latitude'       => 'required|numeric|between:-90,90',
            'company_longitude'      => 'required|numeric|between:-180,180',
            'geofence_radius_meters' => 'required|integer|min:1|max:5000',
            'official_opening_time'  => 'required|date_format:H:i',
            'official_closing_time'  => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $admin = $request->user();
        $admin->update($validator->validated());

        return response()->json(['message' => 'Paramètres mis à jour avec succès.']);
    }
}