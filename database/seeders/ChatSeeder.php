<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groupChats = Chat::factory(10)->create();

        $users = User::all();
        foreach ($groupChats as $chat) {
            $chat->users()->attach(
                $users->random(rand(3, 5))->pluck('id')->toArray()
            );
        }

        $allUsers = User::all();
        $usedPairs = [];
        for ($i = 0; $i < 5; $i++) {
            do {
                $pair = $allUsers->random(2)->pluck('id')->toArray();
                sort($pair);
            } while (in_array($pair, $usedPairs));
            $usedPairs[] = $pair;

            $chat = Chat::factory()->private()->create();
            $chat->users()->attach($pair);
        }
    }
}
