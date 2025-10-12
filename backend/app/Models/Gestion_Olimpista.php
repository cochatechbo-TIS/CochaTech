<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gestion_Olimpista extends Model
{
    // Nombre correcto de la tabla según la migración
    protected $table = 'olimpista'; 

    protected $primaryKey = 'id_olimpista';
    public $incrementing = true;           
    protected $keyType = 'int';            
    public $timestamps = false;

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
    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'id_departamento');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area');
    }

    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'id_nivel');
    }
}
