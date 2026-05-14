<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ChatMember extends Pivot
{
    protected $fillable = [
        'role',
    ];
}
