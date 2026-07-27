<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use Google\Service\Gmail\Message as GmailMessage;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;

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

        // Force l'obtention d'un access token valide
        $this->client->fetchAccessTokenWithRefreshToken($refreshToken);
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

        $service->users_messages->send($this->userEmail, $msg);
    }

    public function __toString(): string
    {
        return 'gmail';
    }
}