<?php

namespace App\Http\Controllers\Api;

use App\Events\Message\MessageDeleted;
use App\Events\Message\MessageSent;
use App\Events\Message\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Attachment;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

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
        $validated = $request->validated();
        $attachmentIds = $validated['attachment_ids'] ?? [];

        // Проверить, нужно ли применять это условие
        // if (empty($request->content) && !$request->hasFile('files')) {
        //     return response()->json(['message' => 'Сообщение не может быть пустым'], 422);
        // }

        if (!empty($attachmentIds)) {
            $attachments = Attachment::whereIn('id', $attachmentIds)
                ->where('user_id', $request->user()->id)
                ->whereNull('message_id')
                ->get();

            if ($attachments->count() !== count($attachmentIds)) {
                return response()->json([
                    'message' => 'Некоторые вложения не найдены, уже использованы или не принадлежат вам'
                ], 422);
            }
        }

        $message = DB::transaction(function () use ($request, $chat, $attachmentIds) {
            $message = $request->user()->messages()->create([
                'chat_id' => $chat->id,
                'content' => $request->input('content'),
            ]);

            $chat->users()->updateExistingPivot($request->user()->id, [
                'last_read_at' => $message->created_at,
            ]);

            if (!empty($attachmentIds)) {
                $attachments = Attachment::whereIn('id', $attachmentIds)->get();

                foreach ($attachments as $attachment) {
                    $oldRelativePath = Str::replaceFirst('/storage/', '', $attachment->path);
                    $extension = pathinfo($oldRelativePath, PATHINFO_EXTENSION);
                    $newRelativePath = "chats/{$chat->id}/messages/{$message->id}/{$attachment->type}/{$attachment->id}" . ($extension ? ".{$extension}" : '');

                    if (Storage::disk('public')->exists($oldRelativePath)) {
                        Storage::disk('public')->move($oldRelativePath, $newRelativePath);
                    }

                    $attachment->update([
                        'path' => Storage::url($newRelativePath),
                        'message_id' => $message->id,
                        'expires_at' => null,
                    ]);
                }
            }

            return $message;
        });

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
        $userIds = $message->chat->users()->pluck('users.id')->toArray();

        foreach ($message->attachments as $attachment) {
            $relativePath = Str::replaceFirst('/storage/', '', $attachment->path);
            Storage::disk($attachment->disk)->delete($relativePath);
        }

        Storage::disk('public')->deleteDirectory("chats/{$chatId}/messages/{$message->id}");

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
