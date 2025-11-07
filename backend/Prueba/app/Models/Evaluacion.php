<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    use HasFactory;
    protected $table = 'evaluacion';
    protected $primaryKey = 'id_evaluacion';
    public $timestamps = false;

    protected $fillable = [
        'id_olimpista',
        'id_nivel_fase',
        'nota',
        'id_equipo',
        'comentario',
        'falta_etica',
        'id_estado_olimpista',
    ];

    // Relación con Olimpista
    public function olimpista()
    {
        return $this->belongsTo(Olimpista::class, 'id_olimpista', 'id_olimpista');
    }

    // Relación con Nivel_Fase
    public function nivelFase()
    {
        return $this->belongsTo(Nivel_Fase::class, 'id_nivel_fase', 'id_nivel_fase');
    }

    // Relación con Estado_Olimpista
    public function estadoOlimpista()
    {
        return $this->belongsTo(Estado_Olimpista::class, 'id_estado_olimpista', 'id_estado_olimpista');
    }
    
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'id_equipo', 'id_equipo');
    }
}
