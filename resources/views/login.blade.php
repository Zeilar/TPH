@extends('app', ['disable' => ['header', 'footer']])

@section('content')
    <form class="authWrapper" action="{{ route('login.submit') }}" method="POST">
        @csrf

        <h2 class="authHeader">Sign in</h2>

        <div class="inputRow">
            <div class="inputIcon">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" class="svg-inline--fa fa-user fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
            </div>
            <input
                class="@error('id') error @enderror" type="text" value="{{ old('id') }}"
                placeholder="Username or email" required name="id" id="id"
            />
        </div>

        <div class="inputRow">
            <div class="inputIcon">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lock" class="svg-inline--fa fa-lock fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path></svg>
            </div>
            <input
                class="@error('password') error @enderror" type="password" required
                placeholder="Password" name="password" id="password"
            />
            <div class="passwordToggler" data-id="password"><!-- PasswordToggler component --></div>
        </div>

        <div class="rememberRow">
            <div class="checkboxWrapper">
                <div class="checkbox" data-name="remember" data-id="remember"></div>
                <label for="remember">Remember me</label>
            </div>

            <a class="forgotPassword" href="{{ route('register.form') }}">
                <p>Forgot password?</p>
            </a>
        </div>

        <button class="authSubmit btnPrimary block" type="submit">Sign in</button>

        <p class="signup">
            <span class="signupText">Not a member?</span>
            <a class="signupLink" href="{{ route('register.form') }}">Register</a>
        </p>
    </form>
@endsection