<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomResetPasswordNotification extends Notification
{
    use Queueable;

    public $url;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $url)
    {
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Restablecer tu contraseña de Oh! SanSi')
                    ->line('Has recibido este correo porque solicitaste restablecer la contraseña de tu cuenta.')
                    ->line('Haz clic en el botón de abajo para continuar:')
                    ->action('Restablecer Contraseña', $this->url)
                    ->line('Este enlace de restablecimiento de contraseña expirará en 60 minutos.')
                    ->line('Si no solicitaste esto, puedes ignorar este correo de forma segura.');
    }
}
