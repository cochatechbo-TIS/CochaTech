<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Asumiendo que la migración create_fase_table define 'id_fase' y 'nombre_fase'
class Fase extends Model
{
    use HasFactory;
    protected $table = 'fase';
    protected $primaryKey = 'id_fase';
    public $timestamps = false;
}
