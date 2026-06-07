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
            'id'          => $this->id,
            'chat_id'     => $this->chat_id,
            'content'     => $this->content,
            'attachments' => $this->attachments->map(fn($attachment) => [
                'id'   => $attachment->id,
                'url'  => $attachment->url,
                'path'  => $attachment->path,
                'type' => $attachment->type,
                'name' => $attachment->name,
                'size' => $attachment->size,
                'mime_type' => $attachment->mime_type,
            ]),
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
