<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
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
            ->withPivot(['role'])
            ->withTimestamps();
    }
}
