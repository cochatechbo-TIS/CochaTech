<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Olimpista extends Model
{
    use HasFactory;
    protected $table = 'olimpista';
    protected $primaryKey = 'id_olimpista';
    public $timestamps = false; // La migración no define timestamps de Eloquent

    protected $fillable = [
        'nombre', 'apellidos', 'ci', 'institucion', 
        'id_area', 'id_nivel', 'grado', 'contacto_tutor', 
        'nombre_tutor', 'id_departamento'
    ];

    // Relación con Evaluacion (Un olimpista puede tener muchas evaluaciones)
    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'id_olimpista', 'id_olimpista');
    }

    // Relación con Area
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    // Relación con Nivel
    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }
        public function nivelFase()
    {
        return $this->belongsTo(NivelFase::class, 'id_nivel_fase');
    }

}
