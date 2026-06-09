<?php

namespace App\Http\Controllers\Api;

use App\Events\Message\MessageDeleted;
use App\Events\Message\MessageSent;
use App\Events\Message\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function list(Chat $chat) {
        $messages = $chat->messages()
            ->with(['user', 'attachments'])
            ->orderBy('created_at')
            ->get();

        return response()->json(
            MessageResource::collection($messages)
        );
    }

    public function send(SendMessageRequest $request, Chat $chat) {
        $request->validated();

        // Проверить, нужно ли применять это условие
        // if (empty($request->content) && !$request->hasFile('files')) {
        //     return response()->json(['message' => 'Сообщение не может быть пустым'], 422);
        // }

        $message = $request->user()->messages()->create([
            'chat_id' => $chat->id,
            'content' => $request->input('content'),
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $mime = $file->getMimeType();

                $type = match (true) {
                    str_starts_with($mime, 'image/') => 'image',
                    str_starts_with($mime, 'video/') => 'video',
                    default => 'file',
                };

                $directory = "chats/{$chat->id}/messages/{$message->id}/{$type}";

                $path = Storage::disk('public')->putFile($directory, $file);

                $message->attachments()->create([
                    'path' => Storage::url($path),
                    'disk' => 'public',
                    'type' => $type,
                    'name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $mime,
                ]);
            }
        }

        $message->load(['user', 'attachments']);
        
        broadcast(new MessageSent($chat, $message))->toOthers();


        return response()->json(new MessageResource($message), 201);
    }

    public function update(Request $request, Message $message) {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        $validated = $validator->validated();

        $message->update([
            'content' => $validated['content'],
        ]);

        $latestMessage = $message->chat->messages()->latest()->first();
        $isLatest = $latestMessage && $latestMessage->id === $message->id;

        $message->load(['user', 'attachments']);

        broadcast(new MessageUpdated($message, $isLatest))->toOthers();

        return response()->json(
            new MessageResource($message)
        );
    }

    public function delete(Message $message) {
        $chatId = $message->chat_id;

        if ($message->attachments()->exists()) {
            $firstAttachment = $message->attachments()->first();

            $messageFolder = dirname(dirname($firstAttachment->path));
            Storage::disk($firstAttachment->disk)->deleteDirectory($messageFolder);
        }

        $userIds = $message->chat->users()->pluck('users.id')->toArray();

        $newLatest = $message->chat->messages()
            ->where('id', '!=', $message->id)
            ->latest()
            ->first();

        $message->delete();

        broadcast(new MessageDeleted($userIds, $message->id, $chatId, $newLatest))->toOthers();

        return response()->json([
            'message' => 'Сообщение успешно удалено'
        ]);
    }
}
