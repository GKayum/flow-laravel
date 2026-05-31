<?php

namespace App\Events\Chat;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatDeleted implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $chatId,
        public array $userIds,
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return array_map(function ($id) {
            return new PrivateChannel("user.{$id}");
        }, $this->userIds);
    }

    public function broadcastAs(): string
    {
        return 'chat.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'chat_id' => $this->chatId,
        ];
    }
}
