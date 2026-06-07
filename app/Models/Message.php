<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'chat_id',
    ];

    public function chat() {
        return $this->belongsTo(Chat::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function attachments() {
        return $this->hasMany(Attachment::class);
    }

    protected function createdAtTime(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->created_at->format('H:i'),
        );
    }
}
