<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    private string $accessToken = '';
    private string $projectId;

    public function __construct()
    {
        $this->projectId = config('firebase.project_id', env('FIREBASE_PROJECT_ID'));
        $this->authenticate();
    }

    private function authenticate(): void
    {
        $credentialsPath = config('firebase.credentials.file', storage_path('app/firebase-credentials.json'));

        if (!file_exists($credentialsPath)) {
            Log::error('FCM : fichier credentials introuvable → ' . $credentialsPath);
            return;
        }

        $scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
        $credentials = new ServiceAccountCredentials($scopes, $credentialsPath);
        $authToken = $credentials->fetchAuthToken();
        $this->accessToken = $authToken['access_token'] ?? '';
    }

    /**
     * Envoie une notification push à un token FCM.
     */
    public function sendToDevice(string $token, string $title, string $body, array $data = []): bool
    {
        if (!$this->accessToken) {
            Log::error('FCM : pas de token d’accès.');
            return false;
        }

        $payload = [
            'message' => [
                'token'        => $token,
                'notification' => [
                    'title' => $title,
                    'body'  => $body,
                ],
                'data' => $data,
                'android' => [
                    'priority'     => 'high',
                    'notification' => [
                        'sound'      => 'default',
                        'channel_id' => 'default',
                    ],
                ],
                'apns' => [
                    'payload' => [
                        'aps' => [
                            'sound' => 'default',
                        ],
                    ],
                ],
            ],
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->accessToken,
            'Content-Type'  => 'application/json',
        ])->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", $payload);

        if ($response->successful()) {
            Log::info('FCM envoyé avec succès', ['token' => $token]);
            return true;
        }

        Log::error('FCM échec', ['status' => $response->status(), 'body' => $response->body()]);
        return false;
    }
}