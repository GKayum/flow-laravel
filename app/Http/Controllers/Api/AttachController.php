<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadAttachmentRequest;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachController extends Controller
{
    public function upload(UploadAttachmentRequest $request) {
        // $request->validated(); // Проверить

        $file = $request->file('file');
        $mime = $file->getMimeType();

        $type = match (true) {
            str_starts_with($mime, 'image/') => 'image',
            str_starts_with($mime, 'video/') => 'video',
            default => 'file',
        };

        $directory = "temp/attachments/{$request->user()->id}";
        $path = Storage::disk('public')->putFile($directory, $file);

        $attachment = Attachment::create([
            'user_id' => $request->user()->id,
            'message_id' => null, // Проверить
            'path' => Storage::url($path),
            'disk' => 'public',
            'type' => $type,
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $mime,
            'expires_at' => now()->addHours(24),
        ]);

        return response()->json([
            'id' => $attachment->id,
            'url' => $attachment->path,
            'type' => $type,
            'name' => $attachment->name,
            'size' => $attachment->size,
        ], 201);
    }

    public function destroy(Request $request, Attachment $attachment) {
        if ($attachment->user_id !== $request->user()->id || $attachment->message_id !== null) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $relativePath = Str::replaceFirst('/storage/', '', $attachment->path);
        Storage::disk($attachment->disk)->delete($relativePath);

        $attachment->delete();

        return response()->json(['message' => 'Вложение удалено']);
    }
}
