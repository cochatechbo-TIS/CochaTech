<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // tu tabla ya maneja timestamps propios (fecha_registro, ultimo_acceso)

    protected $fillable = [
        'nombre', 'correo', 'password', 'telefono',
        'fecha_registro', 'ultimo_acceso', 'id_rol', 'id_area'
    ];

    // Relación con Rol
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    // Relación con Área
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area');
    }
}
