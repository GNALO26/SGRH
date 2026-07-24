<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmployeeCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $employee, public string $plainPassword) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenue dans le SGRH - Vos identifiants',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.employee_created',
            with: [
                'employee' => $this->employee,
                'password' => $this->plainPassword,
            ]
        );
    }
}