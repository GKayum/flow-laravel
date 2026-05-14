<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    public function list(Request $request) {
        $chats = $request->user()->chats()->latest()->get();
        return response()->json(
            ChatResource::collection($chats)
        );
    }

    public function create(Request $request) {
        $data = $request->all();

        $validator = Validator::make($data, [
            'name' => 'required|string|max:64',
            'avatar' => 'nullable|image|mimetypes:image/jpg,image/jpeg,image/png,image/webp',
            'members' => 'nullable|array',
            'members.*.id' => 'nullable|integer|exists:users,id',
        ]);

        $validated = $validator->validated();

        if ($request->hasFile('avatar')) {
            $path = Storage::disk('public')->putFile('avatars', $request->file('avatar'));
            $validated['avatar'] = Storage::url($path);
        }

        $user = Auth::user();

        $chat = $user->chats()->create([
            'name' => $validated['name'],
            'avatar' => $validated['avatar'] ?? null,
            'is_group' => true,
        ]);

        $syncData = [];
        $syncData[$user->id] = ['role' => 'owner'];

        if (!empty($validated['members'])) {
            foreach ($validated['members'] as $member) {
                $syncData[$member['id']] = ['role' => 'member'];
            }
        }
        
        $chat->users()->sync($syncData);

        return response()->json([
            'message' => 'Групповой чат успешно создан!',
            'chat' => new ChatResource($chat),
        ]);
    }
}
