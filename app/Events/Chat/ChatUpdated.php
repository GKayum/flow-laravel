<?php

namespace App\Events\Chat;

use App\Http\Resources\ChatResource;
use App\Models\Chat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatUpdated implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Chat $chat
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $userIds = $this->chat->users()->pluck('users.id')->toArray();

        return array_map(function ($id) {
            return new PrivateChannel("user.{$id}");
        }, $userIds);
    }

    public function broadcastAs(): string
    {
        return 'chat.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'chat' => new ChatResource($this->chat),
        ];
    }
}
