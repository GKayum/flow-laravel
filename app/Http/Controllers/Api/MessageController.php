<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function list(Chat $chat) {
        $messages = $chat->messages()->orderBy('created_at')->get();

        $messages->load('user');

        return response()->json(
            MessageResource::collection($messages)
        );
    }

    public function send(Request $request, Chat $chat) {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        $validated = $validator->validated();

        $validated['chat_id'] = $chat->id;

        $message = $request->user()->messages()->create($validated);

        broadcast(new MessageSent($chat, $message))->toOthers();

        $message->load('user');

        return response()->json(new MessageResource($message));
    }

    public function update(Request $request, Message $message) {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        $validated = $validator->validated();

        $message->update([
            'content' => $validated['content'],
        ]);

        broadcast(new MessageUpdated($message))->toOthers();

        return response()->json(
            new MessageResource($message)
        );
    }

    public function delete(Message $message) {
        broadcast(new MessageDeleted($message))->toOthers();
        
        $message->delete();

        return response()->json([
            'message' => 'Сообщение успешно удалено'
        ]);
    }
}
