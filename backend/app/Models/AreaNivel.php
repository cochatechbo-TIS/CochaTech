<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// CORRECCIÓN: Nombre de clase cambiado a PascalCase
class AreaNivel extends Model
{
    protected $table = 'area_nivel';   
    protected $primaryKey = 'id_area_nivel';
    public $incrementing = true;
    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'id_area',
        'id_nivel',
        'id_evaluador'
    ];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function nivel(): BelongsTo
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }

    public function evaluador()
    {
        return $this->belongsTo(Evaluador::class, 'id_evaluador', 'id_evaluador');
    }
}
