<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\EmployeeCreatedMail;
use App\Models\User;
use App\Services\ActivityService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmployeeController extends Controller
{
    public function __construct(
        private ActivityService $activityService,
        private NotificationService $notificationService
    ) {}

    public function index()
    {
        $employees = User::where('role', 'employee')->get();
        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users',
            'password'    => 'required|string|min:8',
            'base_salary' => 'nullable|numeric',
            'matricule'   => 'nullable|string',
            'position'    => 'nullable|string',
            'department'  => 'nullable|string',
        ], [
            'email.unique' => 'Cet email est déjà utilisé par un autre employé.',
        ]);

        $plainPassword = $validated['password'];
        $validated['password'] = Hash::make($plainPassword);
        $validated['role'] = 'employee';

        $employee = User::create($validated);

        // Envoi de l'email de bienvenue (avec logo, identifiants)
        try {
            Mail::to($employee->email)->send(new EmployeeCreatedMail($employee, $plainPassword));
        } catch (\Throwable $e) {
            report($e);
        }

        // Log d'activité
        try {
            $this->activityService->log(
                request()->user(),
                'employé_créé',
                "L'employé {$employee->name} a été créé.",
                'fas fa-user-plus'
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json($employee, 201);
    }

    public function show(User $employee)
    {
        if ($employee->role !== 'employee') abort(404);
        return response()->json($employee);
    }

    public function update(Request $request, User $employee)
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|unique:users,email,' . $employee->id,
            'base_salary' => 'nullable|numeric',
            'matricule'   => 'nullable|string',
            'position'    => 'nullable|string',
            'department'  => 'nullable|string',
        ], [
            'email.unique' => 'Cet email est déjà utilisé par un autre employé.',
        ]);
        $employee->update($validated);
        return response()->json($employee);
    }

    public function updatePassword(Request $request, User $employee)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);
        $employee->update([
            'password' => Hash::make($request->password),
        ]);
        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }

    public function destroy(User $employee)
    {
        if ($employee->role !== 'employee') abort(404);
        $employee->delete();

        try {
            $this->activityService->log(
                request()->user(),
                'employé_supprimé',
                "L'employé {$employee->name} a été supprimé.",
                'fas fa-user-minus'
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json(null, 204);
    }
}