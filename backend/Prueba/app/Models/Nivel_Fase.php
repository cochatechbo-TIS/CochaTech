<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // <-- Añadido por claridad

class Nivel_Fase extends Model
{

    use HasFactory;


    protected $table = 'nivel_fase';
    protected $primaryKey = 'id_nivel_fase';
    public $timestamps = false;

    protected $fillable = [

        'id_fase', 'id_nivel', 'id_estado_fase', 'comentario'
    ];

    // Relación con Fase
    public function fase(): BelongsTo // <-- Tipo de retorno añadido
    {
        return $this->belongsTo(Fase::class, 'id_fase', 'id_fase');
    }

    // Relación con Nivel
    public function nivel(): BelongsTo // <-- Tipo de retorno añadido
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }
    
    /**
     * Relación con Estado_Fase.
     * * CORRECCIÓN: Renombrada de 'estadoFase' a 'estado_fase' 
     * para coincidir con la llamada ->with('estado_fase') 
     * en tu Evaluacion_Controller.
     */
    public function estado_fase(): BelongsTo // <-- CORREGIDO EL NOMBRE
    {
        return $this->belongsTo(Estado_Fase::class, 'id_estado_fase', 'id_estado_fase');
    }
}