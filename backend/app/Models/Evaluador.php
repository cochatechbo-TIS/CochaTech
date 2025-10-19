<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluador extends Model
{
    protected $table = 'evaluador';
    protected $primaryKey = 'id_evaluador';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; // ya que tienes created_at manual

    protected $fillable = [
        'id_usuario',
        'id_area',
        'id_nivel',
        'disponible',
    ];

    // Relación con usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    // Relación con área
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    // Relación con nivel
    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }

    public function getNombreCompletoAttribute()
    {
        return "{$this->nombre} {$this->apellidos}";
    }

}
