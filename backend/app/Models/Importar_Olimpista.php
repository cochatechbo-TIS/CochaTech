<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Importar_Olimpista extends Model
{
    protected $table = 'olimpistas';
    protected $primaryKey = 'id_olimpista';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nombre', 'apellidos','ci',  'institucion', 'area', 'nivel', 'grado',
        'contacto_tutor', 'id_departamento'
    ];
}