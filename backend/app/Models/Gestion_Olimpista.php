<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gestion_Olimpista extends Model
{
    protected $table = 'olimpistas'; 
    protected $primaryKey = 'id_olimpista'; 
    public $incrementing = true;   
    protected $keyType = 'int';           
    public $timestamps = false;///me dio error por no poner esto ey que este en false 

    protected $fillable = [
        'ci', 'nombre', 'institucion', 'area', 'nivel', 'grado',
        'contacto_tutor', 'id_departamento'
    ];

    // Relación con Departamento
    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'id_departamento');
    }
}