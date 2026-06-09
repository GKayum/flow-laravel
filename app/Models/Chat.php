<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'avatar',
        'is_group',
    ];

    public function latestMessage() {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function messages() {
        return $this->hasMany(Message::class);
    }

    public function users() {
        return $this->belongsToMany(User::class, 'chat_members')
            ->using(ChatMember::class)
            ->withPivot(['role', 'last_read_message_id'])
            ->withTimestamps();
    }

    public function unreadCountFor(User|int $user) {
        $userId = $user instanceof User ? $user->id : $user;

        $lastReadId = $this->users()
            ->where('user_id', $userId)
            ->first()?->pivot->last_read_message_id ?? 0;

        return $this->messages()
            ->where('id', '>', $lastReadId)
            ->count();
    }
}
