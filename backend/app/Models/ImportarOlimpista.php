<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportarOlimpista extends Model
{
    protected $table = 'olimpistas';
    protected $primaryKey = 'id_olimpista';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'ci', 'nombre', 'institucion', 'area', 'nivel', 'grado',
        'contacto_tutor', 'id_departamento'
    ];
}