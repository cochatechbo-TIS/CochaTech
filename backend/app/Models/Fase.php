<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- AÑADIDO

// Asumiendo que la migración create_fase_table define 'id_fase' y 'nombre_fase'
class Fase extends Model
{
    use HasFactory;
    protected $table = 'fase';
    protected $primaryKey = 'id_fase';
    public $timestamps = false;

    /**
     * Define la relación: Una Fase tiene muchos registros Nivel_Fase.
     * (ESTA ES LA FUNCIÓN QUE FALTABA)
     */
    public function nivel_fases(): HasMany
    {
        // Esto enlaza 'fase.id_fase' (local) con 'nivel_fase.id_fase' (foránea)
        return $this->hasMany(Nivel_Fase::class, 'id_fase', 'id_fase');
    }
}