<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluador extends Model
{
    protected $table = 'evaluador';
    protected $primaryKey = 'id_evaluador';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false; 

    protected $fillable = [
        'id_usuario',
        'id_area',
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

}
