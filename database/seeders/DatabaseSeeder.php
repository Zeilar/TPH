<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            SettingSeeder::class,
            RankSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            ChatMessageSeeder::class,
            CategorySeeder::class,
        ]);
    }
}
