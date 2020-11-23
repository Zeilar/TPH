<?php

namespace Tests\Feature;

use Illuminate\Support\Str;
use Tests\TestCase;

class LoginTest extends TestCase
{
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function testExample()
    {
        $response = $this->json('POST', '/api/login', [
            'username' => 'user',
            'password' => '123',
        ]);

        $response->assertStatus(200);
    }
}
