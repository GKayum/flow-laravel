<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
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

        $message->load('user');

        return response()->json(new MessageResource($message));
    }
}
