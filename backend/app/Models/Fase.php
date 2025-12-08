<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; 

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
        $now = now('America/La_Paz');

        // Si no tiene fechas, siempre está activa
        if (!$this->fecha_inicio || !$this->fecha_fin) {
        return false;
        }

        // Si solo tiene fecha inicio
        if ($this->fecha_inicio && !$this->fecha_fin) {
            return $now->greaterThanOrEqualTo($this->fecha_inicio);
        }

        // Si solo tiene fecha fin
        if (!$this->fecha_inicio && $this->fecha_fin) {
            return $now->lessThanOrEqualTo($this->fecha_fin);
        }

        // Si tiene ambas fechas
        return $now->between(
            $this->fecha_inicio,
            $this->fecha_fin
        );
    }

    public function estaExpirada(): bool
    {
        // Si no hay fecha fin, nunca expira
        /*if (!$this->fecha_fin) {
            return false;
        }*/

        return now('America/La_Paz')
            ->greaterThan($this->fecha_fin->copy()->setTimezone('America/La_Paz'));
    }

    protected function serializeDate($date)
    {
        return $date->setTimezone('America/La_Paz')->format('Y-m-d H:i:s');
    }
    public function faltaConfigurarFechas(): bool
    {
        return !$this->fecha_inicio || !$this->fecha_fin;
    }

}