<?php

namespace App\Events\Message;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeleted implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public array $userIds,
        public int $messageId,
        public int $chatId,
        public ?Message $newLatestMessage,
    ) {
        if ($this->newLatestMessage) {
            $this->newLatestMessage->load('user');
        }
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
        return 'message.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'chat_id' => $this->chatId,
            'message_id' => $this->messageId,
            'latest_message' => $this->newLatestMessage 
                ? (new MessageResource($this->newLatestMessage))->resolve() 
                : null,
        ];
    }
}
