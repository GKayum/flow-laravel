<?php

namespace App\Events\Chat;

use App\Http\Resources\UserResource;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMemberRemoved implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Chat $chat,
        public User $member,
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
        return 'chatmember.removed';
    }

    public function broadcastWith(): array
    {
        return [
            'chat_id'   => $this->chat->id,
            'member_id' => $this->member->id,
            'members'   => UserResource::collection($this->chat->users)
        ];
    }
}
