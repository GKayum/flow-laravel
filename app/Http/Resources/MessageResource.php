<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'chat_id'    => $this->chat_id,
            'content'    => $this->content,
            'image'      => $this->image,
            'time'       => $this->created_at_time,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => [
                'id'     => $this->user->id,
                'name'   => $this->user->name,
                'avatar' => $this->user->avatar,
            ],
        ];
    }
}
