<?php

namespace App\Console\Commands;

use App\Models\Attachment;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Signature('attachments:cleanup')]
#[Description('Удалить просроченные временные вложения')]
class CleanupAttachments extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $attachments = Attachment::whereNull('message_id')
            ->where('expires_at', '<', now())
            ->get();

        $count = 0;
        foreach ($attachments as $attachment) {
            $relativePath = Str::replaceFirst('/storage/', '', $attachment->path);
            Storage::disk($attachment->disk)->delete($relativePath);
            $attachment->delete();
            $count++;
        }

        $this->info("Удалено {$count} просточенных сообщений.");
    }
}
