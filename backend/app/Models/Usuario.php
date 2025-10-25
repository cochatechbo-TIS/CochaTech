<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Auth\Passwords\CanResetPassword; // <-- IMPORTAR ESTO

class Usuario extends Authenticatable
{
    // AÑADIR CanResetPassword AL use
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword; 

    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';

    // Laravel usará estos nombres para created_at y updated_at ??
    const CREATED_AT = 'fecha_registro';
    const UPDATED_AT = 'ultimo_acceso';

    protected $fillable = [
        'nombre',
        'apellidos',
        'ci',
        'email',
        'password',
        'telefono',
        'id_rol',
        'activo',
        'fecha_registro',
        'ultimo_acceso',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }
    public function responsable()
    {
        return $this->hasOne(Responsable_Area::class, 'id_usuario', 'id_usuario');
    }

        // --- ¡NUEVO! ---
    /**
     * Sobrescribimos el método para enviar la notificación de reseteo de contraseña.
     * Esto nos permite personalizar el email que se envía.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        // Construimos la URL que irá en el email.
        // Apunta a tu frontend, no al backend.
        $url = env('FRONTEND_URL', 'http://localhost:3000') . 
               '/reset-password/' . $token . 
               '?email=' . urlencode($this->email);

        // Aquí usamos una notificación simple de Laravel.
        // Asegúrate de que tu .env esté configurado para enviar emails (ej. Mailtrap).
        $this->notify(new \App\Notifications\CustomResetPasswordNotification($url));
    }

}