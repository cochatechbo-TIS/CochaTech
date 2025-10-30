<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nivel extends Model
{
    use HasFactory;

    protected $table = 'nivel';
    protected $primaryKey = 'id_nivel';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'id_area',
        'id_evaluador',
        'es_grupal'
    ];

    // Relaciones
    
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function evaluador()
    {
        return $this->belongsTo(Evaluador::class, 'id_evaluador', 'id_evaluador');
    }

    public function olimpistas()
    {
        return $this->hasMany(Olimpista::class, 'id_nivel', 'id_nivel');
    }
}
