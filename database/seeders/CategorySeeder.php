<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Thread;
use App\Models\Post;

class CategorySeeder extends Seeder
{
    private function createCategory(string $name, string $icon): void {
        Category::factory(['name' => $name, 'icon' => $icon])
            ->has(Thread::factory()->count(rand(3, 5))
                ->has(Post::factory()->count(rand(50, 100)))
            )
        ->count(1)
        ->create();
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->createCategory('General', 'general');
        $this->createCategory('Gaming', 'gaming');
        $this->createCategory('Astronomy', 'astronomy');
        $this->createCategory('Science', 'science');
        $this->createCategory('Hobby', 'hobby');
        $this->createCategory('Entertainment', 'entertainment');
        $this->createCategory('Food', 'food');
        $this->createCategory('Sport', 'sport');
    }
}
