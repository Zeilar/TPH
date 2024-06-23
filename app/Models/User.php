<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Scout\Searchable;
use App\Events\CreatedUser;
use App\Events\DeletedUser;
use \Carbon\Carbon;

class User extends Authenticatable
{
    use HasFactory, Notifiable, Searchable;

    protected $dispatchesEvents = ['saved' => CreatedUser::class, 'deleted' => DeletedUser::class];

    protected $appends = ['suspended', 'postsAmount', 'likesAmount', 'rank', 'avatar', 'signature'];
    protected $hidden = ['password', 'updated_at', 'remember_token', 'email_verified_at'];
    protected $fillable = ['username', 'email', 'password', 'role', 'avatar'];
    protected $casts = ['email_verified_at' => 'datetime'];
    protected $with = ['roles', 'settings'];

    public function posts() {
        return $this->hasMany(Post::class);
    }

    public function threads() {
        return $this->hasMany(Thread::class);
    }

    public function postLikes() {
        return $this->hasMany(PostLike::class);
    }

    public function settings() {
        return $this->belongsToMany(Setting::class)->withPivot('value');
    }

    public function likedPosts() {
        return PostLike::where('user_id', '!=', $this->id)
            ->whereIn('post_id', $this->posts()->select('id'))
            ->count();
    }

    public function roles() {
        return $this->belongsToMany(Role::class)->orderBy('clearance');
    }

    public function ranks() {
        return $this->belongsToMany(Rank::class)->orderBy('threshold');
    }

    public function isAuthor(Post $post): bool {
        return $this->id === $post->user->id;
    }

    public function isOp(Thread $thread): bool {
        return $this->id === $thread->user->id;
    }

    public function getClearance(): int {
        return $this->roles()->orderBy('clearance')->firstOrFail()->clearance;
    }

    public function hasRole(string ...$roles): bool {
        return $this->roles()->whereIn('name', $roles)->first() ? true : false;
    }

    public function hasRoles(array $roles): bool {
        foreach ($roles as $role) {
            if ($this->roles()->where('name', $role)->get()->count() <= 0) {
                return false;
            }
        }
        return true;
    }

    public function hasAnyRole(array $roles): bool {
        if ($this->roles()->whereIn('name', $roles)->first() !== null) {
            return true;
        }
        return false;
    }

    public function chatMessages() {
        return $this->hasMany(ChatMessage::class);
    }

    public function suspensions() {
        return $this->hasMany(Suspension::class);
    }

    public function suspended() {
        return $this->suspensions()->where('expiration', '>=', Carbon::now())->pluck('expiration')->first() ?? false;
    }

    public function suspend(string $message = '', $expiration = null): User {
        Suspension::create([
            'expiration' => $expiration ?? Carbon::now()->addDays(7),
            'user_id' => $this->id,
            'message' => $message,
        ]);
        return $this;
    }

    public function pardon(): User {
        $this->suspensions()->where('expiration', '>=', Carbon::now())->update(['expiration' => Carbon::now()->subMinutes(1)]);
        return $this;
    }
    
    public function highestRole() {
        return $this->roles()->orderBy('clearance')->firstOrFail();
    }

    public function lowerClearance(User $user): bool {
        // The lower clearance number, the higher the rank. Lowest possible is 1.
        return $this->getClearance() <= 1 || $this->highestRole()->clearance < $user->highestRole()->clearance;
    }

    public function getSetting(string $name) {
        $setting = $this->settings()->where('name', $name)->first();
        if (is_null($setting)) return;
        return Setting::cast($setting->pivot->value, $setting->datatype);
    }

    public function getSignatureAttribute() {
        return $this->getSetting('signature');
    }

    public function getAvatarAttribute() {
        return $this->getSetting('avatar') ?? 'default.png';
    }

    public function getPostsAmountAttribute(): int {
        return $this->posts()->count();
    }

    public function getLikesAmountAttribute(): int {
        return $this->likedPosts();
    }

    public function getSuspendedAttribute() {
        return $this->suspended();
    }

    public function getRolesAttribute() {
        return $this->roles()->get(['name', 'clearance']);
    }

    public function getRankAttribute() {
        return $this->ranks()->orderByDesc('threshold')->first(['name'])->name;
    }
}
