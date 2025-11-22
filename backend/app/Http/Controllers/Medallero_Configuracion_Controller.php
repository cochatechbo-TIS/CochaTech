<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;
use App\Models\Tipo_Premio;
use App\Models\Medallero_Configuracion;

class Medallero_Configuracion_Controller extends Controller
{
    public function store(Request $request)
    {
        $data = $request->all();

        // Si viene solo un objeto, lo convertimos a array
        if (isset($data['area'])) {
            $data = [$data];
        }

        foreach ($data as $item) {

            // 1. Buscar ID del área por nombre
            $area = Area::where('nombre', $item['area'])->first();

            if (!$area) {
                return response()->json([
                    'error' => "El área '{$item['area']}' no existe en la base de datos."
                ], 400);
            }

            // 2. Mapeo de nombre → id_tipo_premio
            $tipoPremios = Tipo_Premio::pluck('id_tipo_premio', 'nombre')->toArray();

            // Normalizar claves ejemplo: Oro, oro, ORO
            $premios = $item['premios'];

            foreach ($premios as $nombrePremio => $cantidad) {

                $nombreNormalizado = ucfirst(strtolower($nombrePremio)); 

                if (!isset($tipoPremios[$nombreNormalizado])) {
                    return response()->json([
                        "error" => "El tipo de premio '{$nombrePremio}' no existe."
                    ], 400);
                }

                $idTipoPremio = $tipoPremios[$nombreNormalizado];

                // 3. Crear o actualizar
                Medallero_Configuracion::updateOrCreate(
                    [
                        'id_area' => $area->id_area,
                        'id_tipo_premio' => $idTipoPremio
                    ],
                    [
                        'cantidad_por_nivel' => $cantidad
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Medallero actualizado correctamente para todas las áreas'
        ]);
    }

    // mostrar
    public function index()
    {
        $data = Medallero_Configuracion::with(['tipoPremio', 'area'])
            ->get()
            ->groupBy('id_area')
            ->map(function($items) {

                $oro    = $items->firstWhere('id_tipo_premio', 1)->cantidad_por_nivel ?? 0;
                $plata  = $items->firstWhere('id_tipo_premio', 2)->cantidad_por_nivel ?? 0;
                $bronce = $items->firstWhere('id_tipo_premio', 3)->cantidad_por_nivel ?? 0;
                $mencion = $items->firstWhere('id_tipo_premio', 4)->cantidad_por_nivel ?? 0;

                return [
                    'area' => $items->first()->area->nombre,
                    'oro' => $oro,
                    'plata' => $plata,
                    'bronce' => $bronce,
                    'mencion' => $mencion,
                    'total' => $oro + $plata + $bronce + $mencion
                ];
            })
            ->values();

        return response()->json($data);
    }

}
