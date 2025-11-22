<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tipo_Premio extends Model
{
    protected $table = 'tipo_premio';
    protected $primaryKey = 'id_tipo_premio';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'orden'
    ];

    public function configuraciones()
    {
        return $this->hasMany(Medallero_Configuracion::class, 'id_tipo_premio', 'id_tipo_premio');
    }
}
