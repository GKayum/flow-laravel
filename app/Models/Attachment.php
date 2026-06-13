<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    protected $fillable = [
        'user_id',
        'message_id',
        'path',
        'disk',
        'type',
        'name',
        'size',
        'mime_type',
        'duration',
        'expires_at',
    ];

    public function message() {
        return $this->belongsTo(Message::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
