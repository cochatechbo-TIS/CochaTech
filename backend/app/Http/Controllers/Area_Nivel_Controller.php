<?php

namespace App\Http\Controllers;

use App\Models\Importar_Olimpista;
use App\Models\Area_Nivel;
use Illuminate\Http\Request;

class Area_Nivel_Controller extends Controller
{
    public function generarYListar()
    {
        // Obtener combinaciones únicas de area y nivel desde olimpistas
        $combinaciones = Importar_Olimpista::select('id_area', 'id_nivel')
            ->distinct()
            ->get();

        // Insertar si no existe en area_nivel
        foreach ($combinaciones as $c) {
            Area_Nivel::firstOrCreate([
                'id_area' => $c->id_area,
                'id_nivel' => $c->id_nivel,
            ]);
        }

        // Obtener la lista final con nombres de area y nivel
        $lista = Area_Nivel::with(['area', 'nivel'])->get()->map(function ($item) {
            return [
                'id' => $item->id,
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
