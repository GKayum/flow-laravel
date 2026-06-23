<?php

namespace App\Http\Controllers\Api;

use App\Events\User\UserUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function profile(Request $request) {
        return response()->json(
            new UserResource($request->user())
        );
    }

    public function update(Request $request) {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:64',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|required|min:5|confirmed',
            'avatar' => 'nullable|image|mimetypes:image/jpg,image/jpeg,image/png,image/webp,image/gif', // TODO <<GIF>>
            'date_of_birth' => 'nullable|date',
        ]);

        if ($request->hasFile('avatar')) {
            if (!empty($user->avatar)) {
                $relativePath = Str::replaceFirst('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($relativePath);
            }
            $path = Storage::disk('public')->putFile('avatars', $request->file('avatar'));
            $validated['avatar'] = Storage::url($path);
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        broadcast(new UserUpdated($user))->toOthers();

        return response()->json([
            'message' => 'Данные изменены',
            'user' => new UserResource($user),
        ]);
    }
}
