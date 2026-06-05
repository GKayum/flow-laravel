<?php

namespace Database\Factories;

use App\Models\Chat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chat>
 */
class ChatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $groupNames = [
            'Рабочая группа',
            'Планирование отпуска',
            'Домашние дела',
            'Кино и сериалы',
            'Спорт',
            'Друзья',
            'Новости',
            'Музыка',
            'Игры',
            'Книжный клуб',
        ];

        $modifiers = ['', '2024', '🔥', 'основной', 'общий', 'важное'];

        $base = fake()->randomElement($groupNames);
        $extra = fake()->optional(0.6)->randomElement($modifiers);

        return [
            'name' => trim($base . ' ' . $extra),
            'is_group' => true,
            'avatar' => null,
        ];
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_group' => false,
            'name' => null,
        ]);
    }
}
