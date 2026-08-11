<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use Google\Service\Gmail\Message as GmailMessage;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Message as MimeMessage;
use Illuminate\Support\Facades\Log;

class GmailTransport extends AbstractTransport
{
    private Client $client;
    private string $userEmail;

    public function __construct(string $userEmail, string $clientId, string $clientSecret, string $refreshToken)
    {
        parent::__construct();
        $this->userEmail = $userEmail;

        $this->client = new Client();
        $this->client->setClientId($clientId);
        $this->client->setClientSecret($clientSecret);
        $this->client->refreshToken($refreshToken);
        $this->client->addScope(Gmail::MAIL_GOOGLE_COM);

        try {
            $this->client->fetchAccessTokenWithRefreshToken($refreshToken);
        } catch (\Exception $e) {
            Log::error('GmailTransport : impossible de rafraîchir le token', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    protected function doSend(SentMessage $message): void
    {
        $mimeMessage = $message->getOriginalMessage();
        $raw = $mimeMessage->toString();
        $encoded = strtr(base64_encode($raw), ['+' => '-', '/' => '_']);
        $encoded = rtrim($encoded, '=');

        $service = new Gmail($this->client);
        $msg = new GmailMessage();
        $msg->setRaw($encoded);

        try {
            $service->users_messages->send($this->userEmail, $msg);
        } catch (\Exception $e) {
            Log::error('GmailTransport : échec d\'envoi', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function __toString(): string
    {
        return 'gmail';
    }
}