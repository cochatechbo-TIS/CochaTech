<?php

namespace App\Http\Controllers;

// CORRECCIÓN: Actualizados ambos modelos
use App\Models\Olimpista;
use App\Models\AreaNivel;
AreaNivelController.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AreaNivelController extends Controller
{
    public function generarYListar()
    {

        // Obtener combinaciones únicas de area y nivel desde olimpistas
        // CORRECCIÓN: Cambiado de Importar_Olimpista a Olimpista
        $combinaciones = Olimpista::select('id_area', 'id_nivel')
            ->distinct()
            ->get();

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

    /*
     * Listar niveles de un área con cantidad de olimpistas y evaluador asignado
     * solo niveles con olimpistas.
     */
    public function listarPorArea($nombre_area)
    {
        // 1. Buscar el ID del área a partir del nombre
        $area = \App\Models\Area::where('nombre', $nombre_area)->first();

        if (!$area) {
            return response()->json([
                'message' => 'Área no encontrada',
                'data' => []
            ], 404);
        }

        $id_area = $area->id_area;

        // 2. Obtener cantidad de olimpistas agrupados por nivel
        $conteos = \App\Models\Olimpista::select('id_nivel', \DB::raw('COUNT(*) as total'))
            ->where('id_area', $id_area) // aqu va el ID, NO el nombre
            ->groupBy('id_nivel')
            ->get()
            ->keyBy('id_nivel');

        // 3. Filtrar niveles con olimpistas
        $registros = \App\Models\Area_Nivel::with(['nivel', 'evaluador'])
            ->where('id_area', $id_area) // aquí también el ID
            ->whereIn('id_nivel', $conteos->keys())
            ->get()
            ->map(function ($item) use ($conteos) {
                return [
                    'id_area_nivel' => $item->id_area_nivel,
                    'id_nivel' => $item->id_nivel,
                    'nombre_nivel' => $item->nivel->nombre,
                    'cantidad_olimpistas' => $conteos[$item->id_nivel]->total,
                    'evaluador' => $item->evaluador ? $item->evaluador->nombre_completo : '',
                ];
            });

        return response()->json([
            'message' => "Niveles del área '{$nombre_area}' listados correctamente (solo con olimpistas)",
            'data' => $registros
        ]);
    }

    public function listarPorAreaAuth()
    {
        $user = auth()->user();

        // Buscar si es responsable de un área
        $responsable = ResponsableArea::where('id_usuario', $user->id_usuario)->first();

        if (!$responsable) {
            return response()->json([
                'message' => 'El usuario no tiene un área asignada'
            ], 404);
        }

        $id_area = $responsable->id_area;

        // Llamamos al método existente para no repetir código
        $area = Area::find($id_area);
        if (!$area) {
            return response()->json([
                'message' => 'Área no encontrada'
            ], 404);
        }

        return $this->listarPorArea($area->nombre);
    }

}
