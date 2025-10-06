<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class  Responsable_Area extends Model
{
    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellidos',
        'ci',
        'email',
        'password',
        'telefono',
        'area',
        'id_rol',
        'ultimo_acceso',
        'fecha_registro'
    ];

    // Relación con la tabla rol
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }
}
