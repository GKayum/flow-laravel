<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = [
        'name',
        'avatar',
        'is_group',
        'created_by',
    ];

    public function latestMessage() {
        return $this->hasOne(Message::class)->latest();
    }

    public function messages() {
        return $this->hasMany(Message::class);
    }

    public function users() {
        return $this->belongsToMany(User::class, 'chat_members')
            ->using(ChatMember::class)
            ->withPivot(['role']);
    }
}
