<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ChatMember extends Pivot
{
    use HasFactory;
    protected $table = 'chat_members';

    protected $fillable = [
        'role',
        'last_read_message_id',
    ];
}
