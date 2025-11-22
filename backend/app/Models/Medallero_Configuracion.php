<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medallero_Configuracion extends Model
{
    protected $table = 'medallero_configuracion';
    protected $primaryKey = 'id_medallero_config';
    public $timestamps = false; 

    protected $fillable = [
        'id_area',
        'id_tipo_premio',
        'cantidad_por_nivel'
    ];

    // --- Relaciones ---
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function tipoPremio()
    {
        return $this->belongsTo(Tipo_Premio::class, 'id_tipo_premio', 'id_tipo_premio');
    }
}
