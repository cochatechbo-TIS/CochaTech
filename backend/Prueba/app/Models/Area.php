<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $table = 'area';
    protected $primaryKey = 'id_area';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'nombre'
    ];

    // Relación inversa: un área puede tener muchos olimpistas
    public function olimpistas()
    {
        return $this->hasMany(Gestion_Olimpista::class, 'id_area');
    }
}
