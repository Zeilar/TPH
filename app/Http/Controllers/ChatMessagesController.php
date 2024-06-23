<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatMessage;
use App\Models\User;

class ChatMessagesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $this->authorize('viewAny', ChatMessage::class);
        if ($id = request()->query('profile', false)) {
            $profile = User::where('id', $id)->orWhere('username', $id)->firstOrFail();
            $user = auth()->user();
            return ChatMessage::where(function($q) use ($profile, $user) {
                $q->where('receiver_id', $profile->id)->where('user_id', $user->id);
            })
            ->orWhere(function($q) use ($profile, $user) {
                $q->where('receiver_id', $user->id)->where('user_id', $profile->id);
            })
            ->latest()
            ->limit(100)
            ->get()
            ->reverse()
            ->values();
        }
        return abort(400);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $receiver = User::where('id', $request->receiver)->orWhere('username', $request->receiver)->firstOrFail();
        $this->authorize('create', [$receiver, ChatMessage::class]);

        $message = ChatMessage::create([
            'receiver_id' => $receiver->id,
            'user_id'     => auth()->user()->id,
            'content'     => $request->content,
        ]);

        // broadcast(new NewChatMessage($message));

        return response(true);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\ChatMessage  $chatmessage
     * @return \Illuminate\Http\Response
     */
    public function destroy(ChatMessage $chatmessage)
    {
        $this->authorize('delete', $chatmessage);
    }
}