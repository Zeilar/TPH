<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PostLike;
use App\Models\Setting;
use App\Models\Thread;
use App\Models\Post;

class PostsController extends Controller
{
    protected function perPage() {
        return Setting::get('perPage', auth()->user());
    }

    public function index()
    {
        if ($id = request()->query('thread', false)) {
            $thread = Thread::where('id', $id)->orWhere('slug', $id)->orWhere('title', $id)->firstOrFail();
            $posts = $thread->posts()->paginate($this->perPage());
        } else {
            $posts = Post::paginate($this->perPage());
        }
        return response($posts);
    }

    public function store(Request $request)
    {
        $thread = Thread::findOrFail($request->threadId);
        $this->authorize('create', [Post::class, $thread]);

        $request->validate(['content' => 'required|string|min:3|max:1000']);

        $post = Post::create([
            'content'   => $request->content,
            'user_id'   => auth()->user()->id,
            'thread_id' => $thread->id,
        ]);

        return response($post);
    }

    public function show(Post $post)
    {
        return response($post->load('thread'));
    }

    public function update(Request $request, Post $post)
    {
        $this->authorize('update', [$post, $post->thread]);
        $request->validate(['content' => 'required|string|min:3|max:1000']);

        if ($request->editedByMessage) {
            $data = [
                'content'           => $request->content,
                'edited_by'         => auth()->user()->username,
                'edited_by_message' => $request->editedByMessage,
            ];
        } else {
            $data = ['content' => $request->content];
        }
        $post->update($data);

        return response(true);
    }

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);
        $post->delete();
        return response(true);
    }

    public function like(Post $post) {
        $this->authorize('like', $post);

        $user = auth()->user();

        if ($postLike = $user->postLikes()->where('post_id', $post->id)->first()) {
            $postLike->delete();
            return response(true);
        } else {
            PostLike::create(['user_id' => $user->id, 'post_id' => $post->id]);
            return response(true);
        }
    }
}
