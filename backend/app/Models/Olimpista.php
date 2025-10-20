<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Olimpista extends Model
{
    /**
     * La tabla de base de datos asociada con el modelo.
     * Es necesario porque Laravel buscaría "olimpistas" (plural).
     */
    protected $table = 'olimpista'; 

    /**
     * La clave primaria asociada con la tabla.
     */
    protected $primaryKey = 'id_olimpista';
    
    /**
     * Indica si la clave primaria es autoincremental.
     */
    public $incrementing = true;
    
    /**
     * El "tipo" de la clave primaria autoincremental.
     */
    protected $keyType = 'int';
    
    /**
     * Indica si el modelo debe tener timestamps (created_at y updated_at).
     */
    public $timestamps = false; // Tu migración no parece tenerlos

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'nombre', 
        'apellidos', 
        'ci', 
        'institucion', 
        'id_area', 
        'id_nivel', 
        'grado',
        'contacto_tutor', 
        'nombre_tutor',
        'id_departamento'
    ];

    // --- RELACIONES ---

    /**
     * Un Olimpista pertenece a un Departamento.
     */
    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
    }

    /**
     * Un Olimpista pertenece a un Area.
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    /**
     * Un Olimpista pertenece a un Nivel.
     */
    public function nivel(): BelongsTo
    {
        return $this->belongsTo(Nivel::class, 'id_nivel', 'id_nivel');
    }
}