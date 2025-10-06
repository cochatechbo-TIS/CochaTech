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
     * AÑADIDO: Indica a Laravel que este modelo debe usar la tabla 'usuario'.
     */
    protected $table = 'usuario';

    /**
     * AÑADIDO: Especifica el nombre de tu clave primaria personalizada.
     */
    protected $primaryKey = 'id_usuario';

    /**
     * AÑADIDO: Mapea la columna 'created_at' de Laravel a tu columna 'fecha_registro'.
     */
    const CREATED_AT = 'fecha_registro';

    /**
     * AÑADIDO: Mapea la columna 'updated_at' de Laravel a tu columna 'ultimo_acceso'.
     */
    const UPDATED_AT = 'ultimo_acceso';

    /**
     * CORREGIDO: Los atributos que se pueden asignar masivamente.
     * Deben coincidir con los nombres de las columnas de tu tabla.
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'apellidos',
        'email', // Asumiendo que renombraste 'correo' a 'email'
        'password',
        'telefono',
        'activo',
        'id_rol',
    ];

    /**
     * The attributes that should be hidden for serialization.
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * CORREGIDO: Get the attributes that should be cast.
     * Se eliminó 'email_verified_at' porque no existe en tu tabla.
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * CORREGIDO: Define la relación de que un Usuario "pertenece a" un Rol.
     * Se especifican las claves foráneas y locales personalizadas.
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function rol(): BelongsTo
    {
        // Le decimos a Laravel:
        // La llave foránea en esta tabla ('usuario') es 'id_rol'.
        // Esa llave se conecta con la columna 'id_rol' en la tabla 'rol'.
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }
}