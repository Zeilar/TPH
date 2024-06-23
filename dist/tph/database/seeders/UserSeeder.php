<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use App\Models\Setting;
use App\Models\Role;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $files = Storage::allFiles('public/avatars');
        Storage::delete($files);

        $superadminRole = Role::where('name', 'superadmin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $moderatorRole = Role::where('name', 'moderator')->first();

        $superadmin = User::create([
            'username' => 'Philip',
            'email'    => 'philip@angelin.dev',
            'password' => Hash::make(env('ADMIN_PASSWORD')),
        ]);
        $superadmin->roles()->syncWithoutDetaching([$superadminRole->id, $adminRole->id, $moderatorRole->id]);
        
        $admin = User::create([
            'username' => 'Admin',
            'email'    => 'admin@example.com',
            'password' => Hash::make('123'),
        ]);
        $admin->roles()->syncWithoutDetaching([$adminRole->id, $moderatorRole->id]);

        $moderator = User::create([
            'username' => 'Moderator',
            'email'    => 'moderator@example.com',
            'password' => Hash::make('123'),
        ]);
        $moderator->roles()->syncWithoutDetaching([$moderatorRole->id]);

        User::create([
            'username' => 'User',
            'email'    => 'user@example.com',
            'password' => Hash::make('123'),
        ]);

        User::factory()->count(20)->create();
    }
}
