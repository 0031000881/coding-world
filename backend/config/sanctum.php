<?php

use Laravel\Sanctum\Sanctum;

// NOTE: Coding World uses Sanctum "API token" authentication (Bearer tokens
// issued by AuthController and sent via the Authorization header), not
// Sanctum's cookie-based SPA session mode. The 'stateful' domains list below
// is part of Sanctum's default config but is not used, because the
// EnsureFrontendRequestsAreStateful middleware has intentionally been
// removed from the 'api' middleware group (see app/Http/Kernel.php) — that
// middleware is what enables cookie/CSRF-based auth, which this app does
// not use and does not need.
return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
