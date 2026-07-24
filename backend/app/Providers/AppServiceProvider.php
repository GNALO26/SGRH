<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Enregistrer le helper de statuts
        $this->app->singleton('App\Helpers\StatusHelper', function () {
            return new \App\Helpers\StatusHelper();
        });
    }

    public function boot(): void
    {
        // Directive Blade pour traduire les statuts (utilisée éventuellement dans d'autres vues)
        Blade::directive('statut', function ($expression) {
            return "<?php echo app('App\Helpers\StatusHelper')->traduire($expression); ?>";
        });
    }
}