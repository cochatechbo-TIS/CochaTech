<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * La tabla de base de datos asociada con el modelo.
     */
    protected $table = 'usuario';

    /**
     * La clave primaria asociada con la tabla.
     */
    protected $primaryKey = 'id_usuario';

    /**
     * El nombre de la columna "created_at".
     */
    const CREATED_AT = 'fecha_registro';

    /**
     * El nombre de la columna "updated_at".
     */
    const UPDATED_AT = 'ultimo_acceso';

    /**
     * Los atributos que se pueden asignar masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'apellidos',
        'ci',
        'email',
        'password',
        'telefono',
        'id_rol',
        'activo',
        // 'fecha_registro' y 'ultimo_acceso' usualmente no van aquí
        // si son manejados automáticamente por Eloquent (timestamps).
        // Los dejamos fuera de $fillable a menos que los asignes manualmente.
    ];

    /**
     * Los atributos que deben ocultarse para la serialización.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Obtiene los atributos que deben ser casteados.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Define la relación de que un Usuario "pertenece a" un Rol.
     */
    public function rol(): BelongsTo
    {
        // Llave foránea en 'usuario' es 'id_rol'
        // Llave primaria en 'rol' es 'id_rol'
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }
}