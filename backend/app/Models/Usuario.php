<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';

    // Laravel usará estos nombres para created_at y updated_at
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
}
