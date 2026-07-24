<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('role', 'admin')->get()->map(function ($user) {
            $user->is_primary = $user->email === env('ADMIN_EMAIL');
            return $user;
        });
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'admin',
        ]);

        return response()->json($user, 201);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->email === env('ADMIN_EMAIL')) {
            return response()->json(['message' => 'Impossible de supprimer l\'administrateur principal.'], 403);
        }
        $user->delete();
        return response()->json(null, 204);
    }
}