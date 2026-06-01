<?php

namespace App\Events\User;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserUpdated implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $userIds = $this->user->chats()
            ->with('users')
            ->get()
            ->pluck('users.*.id')
            ->flatten()
            ->unique()
            ->toArray();

        return array_map(function ($id) {
            return new PrivateChannel("user.{$id}");
        }, $userIds);
    }

    public function broadcastAs(): string
    {
        return 'user.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'user' => new UserResource($this->user),
        ];
    }
}
