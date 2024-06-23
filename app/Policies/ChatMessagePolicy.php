<?php

namespace App\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\ChatMessage;
use App\Models\User;
use Auth;

class ChatMessagePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function create(User $user, User $profile)
    {
        if (!Auth::check()) return false;
        if ($user->id === $profile->id) {
            return false;
        }

        // If the receipient is moderator or higher, allow messages to be sent (for appeals and such)
        if ($user->suspended()) {
            return $profile->highestRole()->clearance <= 3;
        }

        return true;
    }

    public function viewAny(User $user)
    {
        return Auth::check();
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\User  $user
     * @param  \App\ChatMessage  $chatmessage
     * @return mixed
     */
    public function delete(User $user, ChatMessage $chatmessage)
    {
        if ($user->suspended()) return false;
        return $user->getClearance() <= 2 || $user->lowerClearance($chatmessage->user);
    }
}
