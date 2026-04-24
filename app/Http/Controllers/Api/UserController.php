<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function profile(Request $request) {
        return response()->json(
            new UserResource($request->user())
        );
    }

    public function update(Request $request) {
        $data = $request->all();
        $user = $request->user();
        
        if (isset($data['email']) && $data['email'] === $user->email) {
            unset($data['email']);
        }

        if (isset($data['avatar']) && $data['avatar'] === $user->avatar) {
            unset($data['avatar']);
        }
        
        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|max:64',
            'email' => 'sometimes|required|email|max:255|unique:users,email',
            'password' => 'sometimes|required|min:5|confirmed',
            'avatar' => 'nullable|image|mimetypes:image/jpg,image/jpeg,image/png,image/webp', // TODO <<GIF>>
            'date_of_birth' => 'nullable|date',
        ]);

        $validated = $validator->validated();

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

        $user = Auth::user();
        $user->update($validated);

        return response()->json([
            'message' => 'Данные изменены',
            'user' => new UserResource($user),
        ]);
    }
}
