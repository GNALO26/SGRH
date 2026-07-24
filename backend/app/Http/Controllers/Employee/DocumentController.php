<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Document;

class DocumentController extends Controller
{
    public function index()
    {
        $employeeId = auth()->id();
        $documents = Document::where('employee_id', $employeeId)
            ->orWhereNull('employee_id')
            ->latest()
            ->get();

        return response()->json($documents);
    }
}