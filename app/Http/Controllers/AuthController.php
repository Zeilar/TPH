<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        if (Auth::check()) return abort(405);

        $id = $request->id; // Email or username - we don't know yet

        // Determine whether $id is an email or username and change it accordingly
        $fieldType = filter_var($id, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        request()->merge([$fieldType => $id]);

        // Attempt to log in
        if (Auth::attempt([$fieldType => $id, 'password' => $request->password], $request->remember ? true : false)) {
            return response()->json(null, 200);
        }

        // Check if user exists
        if (empty(User::where($fieldType, $id)->first())) {
            return response(['id' => 'User does not exist.'], 422);
        }

        // If the user does exist, it means the password was incorrect
        if (User::where($fieldType, $id)->count()) {
            return response(['password' => 'Incorrect password.'], 422);
        }

        // If none of the above executes, the user has done something strange
        return abort(400);
    }

    public function register(Request $request) {
        if (Auth::check()) return abort(405);

        $request->validate([
            'username'              => 'required|string|unique:users|min:5|max:15',
            'email'                 => 'required|string|email|unique:users',
            'password'              => 'required|string|confirmed|min:5|max:30',
            'password_confirmation' => 'required|string|min:5|max:30',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);
        if (!$user) return abort(400);
        $user->roles()->attach(Role::where('name', 'user')->first());

        if (!Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
            return abort(400);
        }

        return response($user);
    }

    public function logout() {
        if (!Auth::check()) return abort(405);
        Auth::logout();
        return response(true);
    }
}