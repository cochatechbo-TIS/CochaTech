<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;
    protected $fillable = [
        'nombre', 'apellidos', 'ci', 'email', 'password', 'telefono', 'id_rol', 'ultimo_acceso', 'fecha_registro'
    ];

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }
}
