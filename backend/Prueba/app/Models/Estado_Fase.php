<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Asumiendo que la migración create_estado_fase_table define 'id_estado_fase' y 'nombre_estado'
class Estado_Fase extends Model
{
    use HasFactory;
    protected $table = 'estado_fase';
    protected $primaryKey = 'id_estado_fase';
    public $timestamps = false;
}
