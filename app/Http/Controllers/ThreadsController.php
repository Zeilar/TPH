<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Thread;

class ThreadsController extends Controller
{
    public function index()
    {
        if ($id = request()->query('category', false)) {
            $threads = Category::where('name', $id)->first()->threads;
            foreach ($threads as $thread) {
                $thread->postsAmount = $thread->posts()->count();
                $thread->latestPost = $thread->latestPost()->load('user');
                $thread->op = $thread->op();
            }
        } else {
            $threads = Thread::all();
        }
        return response($threads);
    }

    public function store(Request $request)
    {
        //
    }

    public function show(Thread $thread)
    {
        //
    }

    public function update(Request $request, Thread $thread)
    {
        //
    }

    public function destroy(Thread $thread)
    {
        //
    }
}
