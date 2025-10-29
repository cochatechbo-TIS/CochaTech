<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nivel_Fase extends Model
{
    protected $table = 'nivel_fase';
    protected $primaryKey = 'id_nivel_fase';
    public $timestamps = false;

    protected $fillable = [
        'id_fase',
        'id_nivel',
        'id_estado_fase',
        'comentario'
    ];
}
