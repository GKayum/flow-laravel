<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChatResource;
use App\Http\Resources\UserResource;
use App\Models\Chat;
use App\Models\ChatMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function list(Request $request) {
        $chats = $request->user()->chats()
            ->with(['users', 'latestMessage'])
            ->latest()
            ->get();
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

        $chat->load('users'); // Eager Loading

        return response()->json([
            'message' => 'Групповой чат успешно создан!',
            'chat' => new ChatResource($chat),
        ]);
    }

    public function update(Request $request, Chat $chat) {
        $data = $request->all();
        
        if (isset($data['avatar']) && $data['avatar'] === $chat->avatar) {
            unset($data['avatar']);
        }
        
        $validator = Validator::make($data, [
            'name' => 'sometimes|required|string|max:64',
            'avatar' => 'nullable|image|mimetypes:image/jpg,image/jpeg,image/png,image/webp', // TODO <<GIF>>
        ]);

        $validated = $validator->validated();

        if ($request->hasFile('avatar')) {
            if (!empty($chat->avatar)) {
                $relativePath = Str::replaceFirst('/storage/', '', $chat->avatar);
                Storage::disk('public')->delete($relativePath);
            }
            $path = Storage::disk('public')->putFile('avatars', $request->file('avatar'));
            $validated['avatar'] = Storage::url($path);
        }

        $chat->update($validated);

        $chat->load('users'); // Eager Loading

        return response()->json([
            'message' => 'Данные чата изменены',
            'chat' => new ChatResource($chat),
        ]);
    }

    public function removeMember(Chat $chat, ChatMember $member) {
        Gate::authorize('removeMember', [$chat, $member]);

        $chat->users()->detach($member);

        return response()->json(['message' => 'Участник чата удален']);
    }

    public function changeRole(Request $request, Chat $chat, ChatMember $member) {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:admin,member',
        ]);

        $validated = $validator->validated();

        $chat->users()->updateExistingPivot($member->id, [
            'role' => $validated['role'],
        ]);

        $updatedUser = $chat->users()->where('user_id', $member->id)->first();

        return response()->json(
            new UserResource($updatedUser)
        );
    }
}
