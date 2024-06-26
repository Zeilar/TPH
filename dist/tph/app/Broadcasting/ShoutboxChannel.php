<?php

namespace App\Broadcasting;

use App\Models\User;

class ShoutboxChannel
{
    /**
     * Authenticate the user's access to the channel.
     *
     * @param  \App\Models\User  $user
     * @return array|bool
     */
    public function join(User $user)
    {
        return ['user' => $user];
    }
}
