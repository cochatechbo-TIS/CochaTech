<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- AÑADIDO

// Asumiendo que la migración create_fase_table define 'id_fase' y 'nombre_fase'
class Fase extends Model
{
    use HasFactory;

    protected $table = 'fase';
    protected $primaryKey = 'id_fase';
    public $timestamps = false;

    protected $fillable = [
        'nombre_fase',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    public function estaActiva(): bool
    {
        $now = now();
        return $this->fecha_inicio <= $now && $now <= $this->fecha_fin;
    }

    public function estaExpirada(): bool
    {
        //return now()->greaterThan($this->fecha_fin);
        return now('America/La_Paz')->greaterThan($this->fecha_fin->setTimezone('America/La_Paz'));
    }

    protected function serializeDate($date)
    {
        return $date->setTimezone('America/La_Paz')->format('Y-m-d H:i:s');
    }

}