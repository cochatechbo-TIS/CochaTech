<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'departamento';
    protected $primaryKey = 'id_departamento';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nombre'
    ];

    // Relación inversa: un departamento puede tener muchos olimpistas
    public function olimpistas()
    {
        return $this->hasMany(Gestion_Olimpista::class, 'id_departamento');
    }
}
