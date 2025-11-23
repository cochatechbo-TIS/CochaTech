<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Premiacion_Olimpista extends Model
{
    protected $table = 'premiacion_olimpista';
    protected $primaryKey = 'id_premiacion';
    public $timestamps = false;

    protected $fillable = [
        'id_olimpista',
        'id_equipo',
        'id_nivel',
        'id_tipo_premio',
        'posicion',
    ];

    public function olimpista()
    {
        return $this->belongsTo(Olimpista::class, 'id_olimpista', 'id_olimpista');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'id_equipo', 'id_equipo');
    }

    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }

    public function tipoPremio()
    {
        return $this->belongsTo(Tipo_Premio::class, 'id_tipo_premio', 'id_tipo_premio');
    }
}
