<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Forcer JSON sur toutes les requêtes
        $middleware->prepend(\App\Http\Middleware\ForceJsonResponse::class);
        // Alias pour le middleware de rôle
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Personnaliser le rendu des exceptions pour renvoyer du JSON
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return true; // toujours JSON
        });
    })->create();