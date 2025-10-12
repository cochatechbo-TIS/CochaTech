<?php

namespace App\Http\Controllers;

use App\Models\Importar_Olimpista;
use App\Models\AreaNivel;
use Illuminate\Http\Request;

class AreaNivelController extends Controller
{
    public function generarYListar()
    {
        // 1️⃣ Obtener combinaciones únicas de area y nivel desde olimpistas
        $combinaciones = Importar_Olimpista::select('id_area', 'id_nivel')
            ->distinct()
            ->get();

        // 2️⃣ Insertar si no existe en area_nivel
        foreach ($combinaciones as $c) {
            AreaNivel::firstOrCreate([
                'id_area' => $c->id_area,
                'id_nivel' => $c->id_nivel,
            ]);
        }

        // 3️⃣ Obtener la lista final con nombres de area y nivel
        $lista = AreaNivel::with(['area', 'nivel'])->get()->map(function ($item) {
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
