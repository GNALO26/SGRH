<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    /**
     * Liste tous les jours fériés.
     */
    public function index()
    {
        return response()->json(Holiday::orderBy('date')->get());
    }

    /**
     * Crée un nouveau jour férié.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date'        => 'required|date|unique:holidays,date',
            'description' => 'required|string|max:255',
        ]);

        $holiday = Holiday::create($request->only('date', 'description'));
        return response()->json($holiday, 201);
    }

    /**
     * Supprime un jour férié.
     */
    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return response()->json(null, 204);
    }
}