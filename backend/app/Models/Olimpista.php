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
    protected $appends = ['tutor', 'nota_final', 'unidad_educativa', 'responsable_area'];


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

    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
    }

    public function getTutorAttribute()
    {
        return [
            'nombre' => $this->nombre_tutor,
            'contacto' => $this->contacto_tutor,
        ];
    }

    public function getNotaFinalAttribute()
    {
        // Obtener todas las evaluaciones con su fase
        $evaluaciones = $this->evaluaciones()->with('nivelFase.fase')->get();

        if ($evaluaciones->isEmpty()) {
            return null;
        }

        // Buscar la evaluación cuya fase tiene el mayor ORDEN
        $ultimaEvaluacion = $evaluaciones->sortByDesc(function ($e) {
            return $e->nivelFase->fase->orden; // orden de la fase
        })->first();

        return $ultimaEvaluacion->nota;
    }
   

}
