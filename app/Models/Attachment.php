<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    protected $fillable = [
        'path',
        'disk',
        'type',
        'name',
        'size',
        'mime_type',
    ];

    public function message() {
        return $this->belongsTo(Message::class);
    }
}
