<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Olimpista extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla asociada con el modelo.
     */
    protected $table = 'olimpistas';

    /**
     * La clave primaria asociada con la tabla.
     * Por defecto es 'id', pero la tuya es 'ci'.
     */
    protected $primaryKey = 'ci';

    /**
     * Indica que la clave primaria no es un entero autoincremental.
     */
    public $incrementing = false;

    /**
     * El tipo de dato de la clave primaria.
     */
    protected $keyType = 'string';

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'ci',
        'nombre',
        'institucion',
        'area',
        'nivel',
        'grado',
        'contacto_tutor',
        'id_departamento',
    ];
    // ... dentro de la clase Olimpista

    /**
     * Define la relación: un Olimpista pertenece a un Departamento.
     */
    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
    }
}