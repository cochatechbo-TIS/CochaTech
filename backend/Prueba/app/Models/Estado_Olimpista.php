<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Asumiendo que la migración create_estado_olimpista_table define 'id_estado_olimpista' y 'nombre_estado'
class Estado_Olimpista extends Model
{
    use HasFactory;
    protected $table = 'estado_olimpista';
    protected $primaryKey = 'id_estado_olimpista';
    public $timestamps = false;
}
