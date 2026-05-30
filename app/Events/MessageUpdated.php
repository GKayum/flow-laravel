<?php

namespace App\Events;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Message $message,
        public bool $isLatest = false
    ) {
        $this->message->load('user');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $userIds = $this->message->chat->users()->pluck('users.id')->toArray();

        return array_map(function ($id) {
            return new PrivateChannel('user.' . $id);
        }, $userIds);

        // return [
        //     new PrivateChannel('chat.' . $this->message->chat_id),
        // ];
    }

    public function broadcastAs(): string
    {
        return 'message.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'chat_id' => $this->message->chat_id,
            'message' => (new MessageResource($this->message))->resolve(),
            'is_latest' => $this->isLatest,
        ];
    }
}
