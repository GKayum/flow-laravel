<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chats = Chat::with('users')->get();

        $sampleDialogues = [
            ['Как твои дела?', 'Всё хорошо, спасибо! Как твои?'],
            ['Что делаешь?', 'Смотрю сериал.'],
            ['Привет!', 'Привет!'],
            ['Чем займёмся на выходных?', 'Может, встретимся?'],
        ];

        foreach ($chats as $chat) {
            $members = $chat->users;
            if ($members->count() < 2) continue;

            $startTime = now()->subDays(rand(1, 14));
            $currentTime = $startTime->copy();

            if (fake()->boolean(30)) {
                $pair = fake()->randomElement($sampleDialogues);
                $sender = $members->random();
                $receiver = $members->except($sender->id)->random();

                Message::factory()->create([
                    'chat_id' => $chat->id,
                    'user_id' => $sender->id,
                    'content' => $pair[0],
                    'created_at' => $currentTime,
                ]);
                $currentTime->addSeconds(rand(30, 300));

                Message::factory()->create([
                    'chat_id' => $chat->id,
                    'user_id' => $receiver->id,
                    'content' => $pair[1],
                    'created_at' => $currentTime,
                ]);
                $currentTime->addSeconds(rand(30, 300));
            }

            $count = rand(5, 15);
            for ($i = 0; $i < $count; $i++) {
                $user = $members->random();
                Message::factory()->create([
                    'chat_id' => $chat->id,
                    'user_id' => $user->id,
                    'content' => fake()->realText(rand(20, 100)),
                    'created_at' => $currentTime,
                ]);
                $currentTime->addSeconds(rand(10, 600));
            }
        }
    }
}
