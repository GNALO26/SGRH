<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // L'authentification est déjà assurée par le middleware
    }

    public function rules(): array
    {
        return [
            'latitude'      => 'required|numeric|between:-90,90',
            'longitude'     => 'required|numeric|between:-180,180',
            'justification' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'latitude.required'  => 'Coordonnée GPS latitude manquante.',
            'longitude.required' => 'Coordonnée GPS longitude manquante.',
        ];
    }
}