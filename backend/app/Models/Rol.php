<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla asociada con el modelo.
     */
    protected $table = 'rol';

    /**
     * La clave primaria asociada con la tabla.
     */
    protected $primaryKey = 'id_rol';

    /**
     * Indica si el modelo debe tener timestamps (created_at, updated_at).
     * Tu tabla 'rol' no los tiene, así que lo desactivamos.
     */
    public $timestamps = false;

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'nombre_rol',
    ];
}
