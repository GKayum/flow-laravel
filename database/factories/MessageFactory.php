<?php

namespace Database\Factories;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'chat_id' => Chat::factory(),
            'user_id' => User::factory(),
            'content' => fake()->optional(0.8)->realText(50),
            // 'image'   => fake()->optional(0.9)->passthrough(
            //     'https://placekitten.com/' . mt_rand(200, 400) . '/' . mt_rand(200, 400)
            // ),
            'image' => null,
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
