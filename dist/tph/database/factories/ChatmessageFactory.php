<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Chatmessage;
use App\Models\User;

class ChatmessageFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Chatmessage::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $sender = User::inRandomOrder()->limit(1)->first()->id;

        return [
            'content'     => $this->faker->sentence(10),
            'user_id'     => $sender,
            'receiver_id' => User::inRandomOrder()->where('id', '!=', $sender)->limit(1)->first()->id,
        ];
    }
}
