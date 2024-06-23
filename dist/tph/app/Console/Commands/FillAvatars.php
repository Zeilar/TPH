<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\Storage;
use Illuminate\Console\Command; 
use Illuminate\Support\Str;
use App\Models\Setting;
use App\Models\User;
use Exception;

class FillAvatars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fill-avatars {--force : Force the operation}';

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
        $confirmMessage = 'You are in production mode! This will overwrite existing users, are you sure?';
        if (!$this->option('force') && env('APP_ENV') !== 'local' && !$this->confirm($confirmMessage)) {
            return;
        }

        // Get users that have the default avatar
        $users = User::whereDoesntHave('settings', function($query) {
            return $query->where('name', 'avatar')->where('value', '!=', null);
        })->get();
        
        $total = $users->count();

        if ($total <= 0) {
            return $this->warn('No users with default avatar');
        }

        $successes = $total;

        $bar = $this->output->createProgressBar($total);
        $users->each(function($user) use ($bar, &$successes) {
            $bar->advance();
            try {
                $generatedUser = json_decode(file_get_contents('https://randomuser.me/api'));
                $picture = $generatedUser->results[0]->picture->medium;
                $name = Str::uuid() . substr($picture, strrpos($picture, '/') + 1);
                Storage::put('public\avatars\\'.$name, file_get_contents($picture));
                
                $avatarSetting = Setting::where('name', 'avatar')->first();
                $user->settings()->attach($avatarSetting, ['value' => $name]);
                $this->line("\n<fg=green>Installed $picture for $user->username</>");
            } catch (Exception $e) {
                $successes -= 1;
                $this->error("\n" . $e->getMessage());
            }
        });
        $bar->finish();
        $this->line("\n<fg=green>Installed $successes/$total avatars</>");
        if ($successes !== $total && $this->confirm('Some installations failed, run them again?', true)) {
            $this->call('fill-avatars', ['--force' => true]);
        }
    }
}
