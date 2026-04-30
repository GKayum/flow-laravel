<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Неверные данные для входа'
            ], 401);
        }

        return response()->json([
            'message' => 'Успешная авторизация!',
            'user' => new UserResource(Auth::user()),
        ]);
    }

    public function logout(Request $request) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Выход выполнен!',
        ]);
    }

    public function register(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:30',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|min:5|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);

        return response()->json([
            'message' => 'Успешная регистрация!',
            'user' => new UserResource($user),
        ]);
    }
}
