<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\{
    Admin\StatisticsController,
    ChatMessagesController,
    Admin\UsersController,
    CategoriesController,
    ProfilesController,
    ThreadsController,
    PostsController,
    AuthController,
};
use App\Models\{
    Category,
    Setting,
    Thread,
    Post,
    User,
};

// AuthController
Route::post('register', [AuthController::class, 'register']);
Route::get('logout', [AuthController::class, 'logout']);
Route::post('login', [AuthController::class, 'login']);

// ProfilesController
Route::bind('user', fn($value) => User::where('id', $value)->orWhere('username', $value)->firstOrFail());
// Route::get('user/{user}/messages', [ProfilesController::class, 'messages']);
Route::get('profile/{user}/threads', [ProfilesController::class, 'threads']);
Route::get('profile/{user}/posts', [ProfilesController::class, 'posts']);
Route::get('profile/{user}', [ProfilesController::class, 'show']);

// CategoriesController
Route::bind('category', fn($value) => Category::where('id', $value)->orWhere('name', $value)->firstOrFail());
Route::get('categories/{category}', [CategoriesController::class, 'show']);
Route::get('categories', [CategoriesController::class, 'index']);

// ThreadsController
Route::bind('thread', fn($value) => Thread::where('id', $value)->orWhere('slug', $value)->orWhere('title', $value)->firstOrFail());
Route::resource('threads', ThreadsController::class, ['except' => ['create', 'edit', 'update']]);
Route::post('threads/{thread}', [ThreadsController::class, 'update']);

// PostsController
Route::resource('posts', PostsController::class, ['except' => ['create', 'edit', 'update']]);
Route::put('/posts/{post}/like', [PostsController::class, 'like']);
Route::post('posts/{post}', [PostsController::class, 'update']);

// ChatMessagesController
Route::resource('chatmessages', ChatMessagesController::class, ['except' => ['create', 'edit', 'show']]);

// Admin -> ...Controller
Route::prefix('admin')->middleware('IsAdmin')->group(function() {
    Route::prefix('users')->group(function() {
        Route::resource('/', UsersController::class, ['except' => ['create', 'edit', 'show']])->parameters(['' => 'user']);
        Route::delete('/', [UsersController::class, 'bulkDelete']);
        Route::post('{user}/suspend', [UsersController::class, 'suspend']);
        Route::post('{user}/pardon', [UsersController::class, 'pardon']);
        Route::post('{user}', [UsersController::class, 'update']);
    });
    Route::prefix('statistics')->group(function() {
        Route::get('users', [StatisticsController::class, 'amountOfUsers']);
        Route::get('threads', [StatisticsController::class, 'amountOfThreads']);
        Route::get('posts', [StatisticsController::class, 'amountOfPosts']);
    });
});

Route::get('search', function(Request $request) {
    if (!$request->q) return abort(400);
    $request->validate(['q' => 'required|min:3|max:50']);
    $perPage = Setting::get('perPage', auth()->user());
    $threads = Thread::search($request->q)->paginate($perPage);
    $posts   = Post::search($request->q)->paginate($perPage);
    $users   = User::search($request->q)->paginate($perPage);
    return response([
        'threads' => $threads,
        'posts'   => $posts,
        'users'   => $users,
    ]);
});

Route::get('authenticate', function() {
    $user = auth()->user();
    return response()->json($user, $user ? 200 : 401);
});
