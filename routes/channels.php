<?php

use Illuminate\Support\Facades\Broadcast;
use App\Broadcasting\ThreadChannel;

Broadcast::channel('thread-{id}', ThreadChannel::class);
