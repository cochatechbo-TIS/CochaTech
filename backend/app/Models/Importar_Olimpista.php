<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Importar_Olimpista extends Model
{
    protected $table = 'olimpista'; // coincidencia con la tabla en migración
    protected $primaryKey = 'id_olimpista';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // usas created_at manualmente en la migración

    protected $fillable = [
        'nombre',
        'apellidos',
        'ci',
        'institucion',
        'id_area',
        'id_nivel',
        'grado',
        'contacto_tutor',
        'nombre_tutor',
        'id_departamento'
    ];

    // Relaciones
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function nivel(): BelongsTo
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }
}
