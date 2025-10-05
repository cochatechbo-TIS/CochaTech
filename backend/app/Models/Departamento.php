<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // AÑADIDO: Buena práctica
use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    use HasFactory; // AÑADIDO: Buena práctica

    protected $table = 'departamento';
    protected $primaryKey = 'id_departamento';
    protected $fillable = ['nombre_departamento'];

    // Tu tabla 'departamento' tiene timestamps (created_at, updated_at),
    // así que NO necesitas la línea 'public $timestamps = false;'.
    // Laravel los manejará automáticamente.

    /**
     * Define la relación: un Departamento tiene muchos Olimpistas.
     */
    public function olimpistas()
    {
        // CORREGIDO: Se usa el modelo correcto 'Olimpista'
        return $this->hasMany(Olimpista::class, 'id_departamento', 'id_departamento');
    }
}