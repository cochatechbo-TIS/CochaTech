<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// CORRECCIÓN: Nombre de clase cambiado a PascalCase
class ResponsableArea extends Model
{
    /**
     * La tabla de base de datos asociada con el modelo.
     * Es necesario porque Laravel buscaría "responsable_areas".
     */
    protected $table = 'responsable';

    protected $primaryKey = 'id_responsable';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_area'
    ];

    /**
     * Relación con usuario
     * !! CORRECCIÓN CRÍTICA !!
     * Cambiado de 'Usuario::class' (eliminado) a 'User::class'.
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
}
