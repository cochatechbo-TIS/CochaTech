<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // <-- Añadido

class Evaluador extends Model
{
    protected $table = 'evaluador';
    protected $primaryKey = 'id_evaluador';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_area',
        'id_nivel',
        'disponible',
    ];

    /**
     * Relación con usuario
     * !! CORRECIÓN CRÍTICA !!
     * Cambiado de 'Usuario::class' (eliminado) a 'User::class'.
     */
    public function usuario(): BelongsTo // <-- Tipo de retorno añadido
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación con área
     */
    public function area(): BelongsTo // <-- Tipo de retorno añadido
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    /**
     * Relación con nivel
     */
    public function nivel(): BelongsTo // <-- Tipo de retorno añadido
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }
}