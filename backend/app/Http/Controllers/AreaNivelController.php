<?php

namespace App\Http\Controllers;

// CORRECCIÓN: Actualizados ambos modelos
use App\Models\Olimpista;
use App\Models\AreaNivel;
use Illuminate\Http\Request;

class AreaNivelController extends Controller
{
    public function generarYListar()
    {
        // Obtener combinaciones únicas de area y nivel desde olimpistas
        // CORRECCIÓN: Cambiado de Importar_Olimpista a Olimpista
        $combinaciones = Olimpista::select('id_area', 'id_nivel')
            ->distinct()
            ->get();

        // Insertar si no existe en area_nivel
        foreach ($combinaciones as $c) {
            // CORRECCIÓN: Cambiado de Area_Nivel a AreaNivel
            AreaNivel::firstOrCreate([
                'id_area' => $c->id_area,
                'id_nivel' => $c->id_nivel,
            ]);
        }

        // Obtener la lista final con nombres de area y nivel
        // CORRECCIÓN: Cambiado de Area_Nivel a AreaNivel
        $lista = AreaNivel::with(['area', 'nivel'])->get()->map(function ($item) {
            return [
                // CORRECCIÓN: 'id' no existe, usamos la clave primaria real
                'id' => $item->id_area_nivel, 
                'id_area' => $item->id_area,
                'nombre_area' => $item->area->nombre,
                'id_nivel' => $item->id_nivel,
                'nombre_nivel' => $item->nivel->nombre,
            ];
        });

        return response()->json([
            'message' => 'Tabla area_nivel generada y lista devuelta correctamente',
            'data' => $lista
        ]);
    }
}
