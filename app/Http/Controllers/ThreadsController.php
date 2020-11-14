<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Thread;
use App\Models\Post;

class ThreadsController extends Controller
{
    public function index()
    {
        $threads = Thread::paginate(Thread::$MAX_PER_PAGE);
        if ($id = request()->query('category', false)) {
            $threads = Category::where('name', $id)->orWhere('id', $id)->firstOrFail()->threads()->paginate(Thread::$MAX_PER_PAGE);
            foreach ($threads as $thread) {
                $thread->postsAmount = $thread->posts()->count();
                $thread->latestPost = $thread->latestPost()->load('user');
                $thread->op = $thread->op();
            }
        }
        return response($threads);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Thread::class);
        $request->validate([
            'content' => 'required|string|min:3|max:1000',
            'title'   => 'required|string|min:3|max:150',
        ]);
        $thread = Thread::factory(['title' => $request->title])->create();
        Post::create([
            'content'   => $request->content,
            'user_id'   => auth()->user()->id,
            'thread_id' => $thread->id,
        ]);
        return response($thread);
    }

    public function show(Thread $thread)
    {
        if (request()->query('getCategory', false)) {
            $thread->load('category');
        }
        return response($thread);
    }

    public function update(Request $request, Thread $thread)
    {
        $this->authorize('update', $thread);
        $request->validate(['title' => 'required|string|min:3|max:150']);
        $title = $request->title;
        $thread->update([
            'title'  => $title,
            'slug'   => str_replace(' ', '-', $title),
            'locked' => $request->locked,
        ]);
        return response($thread);
    }

    public function destroy(Thread $thread)
    {
        $this->authorize('delete', $thread);
        $category = $thread->category;
        $thread->delete();
        return response($category);
    }
}
