<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanySettingController extends Controller
{
    public function show(Request $request)
    {
        $admin = $request->user();
        return response()->json([
            'company_latitude'       => $admin->company_latitude,
            'company_longitude'      => $admin->company_longitude,
            'geofence_radius_meters' => $admin->geofence_radius_meters,
            'official_opening_time'  => $admin->official_opening_time,
        ]);
    }

    public function update(Request $request)
    {
        // Remplacer les virgules par des points pour les nombres décimaux
        $request->merge([
            'company_latitude'  => str_replace(',', '.', $request->company_latitude),
            'company_longitude' => str_replace(',', '.', $request->company_longitude),
        ]);

        $validator = Validator::make($request->all(), [
            'company_latitude'       => 'required|numeric|between:-90,90',
            'company_longitude'      => 'required|numeric|between:-180,180',
            'geofence_radius_meters' => 'required|integer|min:1|max:5000',
            'official_opening_time'  => 'required|date_format:H:i',
        ], [
            'official_opening_time.date_format' => 'Le format de l\'heure d\'ouverture doit être HH:MM (ex : 08:00).',
            'company_latitude.between'          => 'La latitude doit être comprise entre -90 et 90.',
            'company_longitude.between'         => 'La longitude doit être comprise entre -180 et 180.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $admin = $request->user();
        $admin->update($validator->validated());

        return response()->json(['message' => 'Paramètres mis à jour avec succès.']);
    }
}