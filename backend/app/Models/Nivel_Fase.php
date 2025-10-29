<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nivel_Fase extends Model
{
    use HasFactory;
    protected $table = 'nivel_fase';
    protected $primaryKey = 'id_nivel_fase';
    public $timestamps = false;

    protected $fillable = [
        'id_fase', 'id_nivel', 'id_estado_fase', 'comentario'
    ];

    // Relación con Fase
    public function fase()
    {
        return $this->belongsTo(Fase::class, 'id_fase', 'id_fase');
    }

    // Relación con Nivel
    public function nivel()
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }
    
    // Relación con Estado_Fase (Asumiendo que tienes un modelo Estado_Fase)
    public function estadoFase()
    {
        // Si no tienes el modelo, puedes crearlo. Por ahora, asumimos que existe.
        // Si no existe, el 'with('estadoFase')' fallará.
        // Creemos un modelo simple si no lo tienes.
        return $this->belongsTo(Estado_Fase::class, 'id_estado_fase', 'id_estado_fase');
    }
}
