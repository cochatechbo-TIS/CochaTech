<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        // 'id_nivel',     <-- ELIMINADO
        // 'disponible',   <-- ELIMINADO
    ];

    /**
     * Relación con usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación con área
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    /**
     * Relación con nivel (ELIMINADA)
     */
    // public function nivel(): BelongsTo 
    // {
    //     return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    // }
}