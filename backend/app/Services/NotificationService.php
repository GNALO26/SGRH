<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Crée une notification en base et envoie une push via FCM si l'utilisateur a un token.
     */
    public function createForUser(User $user, string $message, string $icon = 'fas fa-info-circle', ?string $time = null)
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'icon'    => $icon,
            'message' => $message,
            'time'    => $time ?? now()->diffForHumans(),
        ]);

        // Envoi push via FCM si l'utilisateur possède un token
        if ($user->fcm_token) {
            try {
                app(FcmService::class)->sendToDevice(
                    $user->fcm_token,
                    'SGRH',
                    $message,
                    ['notification_id' => (string) $notification->id]
                );
            } catch (\Exception $e) {
                report($e);
            }
        }

        return $notification;
    }

    /**
     * Crée une notification pour tous les administrateurs.
     */
    public function createForAdmins(string $message, string $icon = 'fas fa-info-circle')
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $this->createForUser($admin, $message, $icon);
        }
    }
}