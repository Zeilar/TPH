<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\Storage;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Models\User;

class FillAvatars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fill-avatars';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Download random profile pictures and assign them to users';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     * Take users with default avatars and assign them a new random one.
     *
     * @return void
     */
    public function handle()
    {
        $users = User::where('avatar', 'default.png');
        $count = $users->count();
        if ($count <= 0) {
            return $this->warn('No users with default avatar');
        }
        $bar = $this->output->createProgressBar($users->count());
        $users->each(function($user) use ($bar) {
            $bar->advance();
            $generatedUser = json_decode(file_get_contents('https://randomuser.me/api'));
            $picture = $generatedUser->results[0]->picture->medium;
            $name = Str::uuid() . substr($picture, strrpos($picture, '/') + 1);
            Storage::put('public\avatars\\'.$name, file_get_contents($picture));
            $user->update(['avatar' => $name]);
        });
        $bar->finish();
        $this->line("\n<fg=green>Installed $count avatars</>");
    }
}
