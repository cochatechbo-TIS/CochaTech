<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log_Cambio_Nota extends Model
{
    use HasFactory;

    protected $table = 'log_cambios_nota';
    protected $primaryKey = 'id_log';

    protected $fillable = [
        'fecha',
        'hora',
        'id_evaluador',
        'nombre_evaluador',
        'id_area',
        'nombre_area',
        'id_nivel',
        'nombre_nivel',
        'id_estudiante',
        'nombre_estudiante',
        'nota_anterior',
        'nota_nueva',
        'motivo'
    ];
}
