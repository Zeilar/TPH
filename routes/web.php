<?php

use Illuminate\Support\Facades\Route;

// AuthController
Route::post('/register', 'AuthController@register')->name('register.submit');
Route::post('/login', 'AuthController@login')->name('login.submit');
Route::get('/logout', 'AuthController@logout')->name('logout');
Route::view('/register', 'register')->name('register.form');
Route::view('/login', 'login')->name('login.form');

// ThreadsController
Route::resource('threads', 'ThreadsController', ['except' => ['create']]);

// PostsController
Route::resource('posts', 'PostsController', ['except' => ['create', 'edit']]);
Route::post('/Posts/{comment}/like', 'PostsController@like');

// Admin -> UsersController
Route::namespace('Admin')->prefix('admin')->middleware('IsOnline')->group(function() {
    Route::resource('/users', 'UsersController', ['except' => ['create']]);
});

Route::view('/', 'app')->name('index');