<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'departamento';
    protected $primaryKey = 'id_departamento';

    protected $fillable = ['nombre_departamento'];

    // Relación con Olimpistas
    public function olimpistas()
    {
        return $this->hasMany(Gestion_Olimpista::class, 'id_departamento');
    }
}
