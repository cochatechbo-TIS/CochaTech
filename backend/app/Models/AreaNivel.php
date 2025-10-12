<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AreaNivel extends Model
{
    protected $table = 'area_nivel';
    protected $primaryKey = 'id_area_nivel'; // 👈 clave primaria real
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = ['id_area', 'id_nivel'];

    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }
}
