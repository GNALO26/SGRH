<?php

namespace App\Providers;

use App\Services\GmailTransport;
use Illuminate\Mail\MailManager;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->resolving(MailManager::class, function (MailManager $mailManager) {
            $mailManager->extend('gmail', function (array $config) {
                return new GmailTransport(
                    $config['user_email'],
                    $config['client_id'],
                    $config['client_secret'],
                    $config['refresh_token']
                );
            });
        });
    }
}