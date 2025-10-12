<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nivel extends Model
{
    protected $table = 'nivel';
    protected $primaryKey = 'id_nivel';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nombre'
    ];

    // Relación inversa: un nivel puede tener muchos olimpistas
    public function olimpistas()
    {
        return $this->hasMany(Gestion_Olimpista::class, 'id_nivel');
    }
}
