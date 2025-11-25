<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipo_Olimpista extends Model
{
    use HasFactory;

    protected $table = 'equipo_olimpista';
    protected $primaryKey = 'id_equipo_olimpista';
    public $timestamps = false;

    protected $fillable = [
        'id_equipo',
        'id_olimpista',
    ];
    public function olimpista()
    {
        return $this->belongsTo(Olimpista::class, 'id_olimpista', 'id_olimpista');
    }

}

