<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    use HasFactory;

    protected $table = 'equipo';
    protected $primaryKey = 'id_equipo';

    protected $fillable = [
        'nombre_equipo',
        'institucion',
        'id_area',
        'id_nivel',
    ];

    // Relaciones
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }

    public function olimpistas()
    {
        return $this->belongsToMany(Importar_Olimpista::class, 'equipo_olimpista', 'id_equipo', 'id_olimpista');
    }
}
