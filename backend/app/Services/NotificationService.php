<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Crée une notification en base et envoie une push FCM si possible.
     */
    public function createForUser(
        User $user,
        string $message,
        string $icon = 'fas fa-info-circle',
        ?string $time = null,
        ?string $link = null
    ) {
        $notification = Notification::create([
            'user_id' => $user->id,
            'icon'    => $icon,
            'message' => $message,
            'link'    => $link,
            'time'    => $time ?? now()->diffForHumans(),
        ]);

        // Envoi push FCM
        if ($user->fcm_token) {
            try {
                app(FcmService::class)->sendToDevice(
                    $user->fcm_token,
                    'SGRH',
                    $message,
                    [
                        'notification_id' => (string) $notification->id,
                        'link'            => $link ?? '',
                    ]
                );
            } catch (\Exception $e) {
                report($e);
            }
        }

        return $notification;
    }

    /**
     * Envoie une notification à tous les administrateurs.
     */
    public function createForAdmins(string $message, string $icon = 'fas fa-info-circle', ?string $link = null)
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $this->createForUser($admin, $message, $icon, null, $link);
        }
    }
}