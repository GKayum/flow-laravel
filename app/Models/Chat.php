<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $fillable = [
        'title',
        'avatar',
        'is_group',
        'created_by',
    ];

    public function messages() {
        return $this->hasMany(Message::class);
    }
}
