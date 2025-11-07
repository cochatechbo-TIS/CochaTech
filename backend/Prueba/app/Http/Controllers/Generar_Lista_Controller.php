<?php

namespace App\Http\Controllers;

use App\Models\Nivel;
use App\Models\Area;
use App\Models\Importar_Olimpista;
use App\Models\Responsable_Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Generar_Lista_Controller extends Controller
{
    /**
     * Listar niveles de un área con cantidad de olimpistas
     * Solo muestra niveles con al menos un inscrito
     */
    public function listarPorArea($nombre_area)
    {
        $area = Area::where('nombre', $nombre_area)->first();

        if (!$area) {
            return response()->json([
                'message' => 'Área no encontrada',
                'data' => []
            ], 404);
        }
        
        // Contar total de fases
        $totalFases = DB::table('fase')->count();

        $niveles = Nivel::where('id_area', $area->id_area)
            ->with(['evaluador'])
            ->get();

        // Contar olimpistas por nivel
        $conteos = Importar_Olimpista::select('id_nivel', DB::raw('COUNT(*) as total'))
            ->where('id_area', $area->id_area)
            ->groupBy('id_nivel')
            ->get()
            ->keyBy('id_nivel');

        $resultado = $niveles->filter(fn($n) => isset($conteos[$n->id_nivel]))
            ->map(function ($n) use ($conteos, $totalFases, $nombre_area) {
                return [
                    'id' => $n->id_nivel,
                    'nombre' => $n->nombre,
                    'competidores' => $conteos[$n->id_nivel]->total ?? 0,
                    'fasesAprobadas' => 0,         // temporal (por ahora en cero)
                    'faseTotales' => $totalFases, 
                    'evaluador' => $n->evaluador?->nombre_completo ?? '',
                    'area' => $nombre_area,
                ];
            })
            ->values();

        return response()->json([
            'message' => "Niveles del área '{$nombre_area}' listados correctamente (solo con olimpistas)",
            'data' => $resultado
        ]);
    }

    /**
     * Listar niveles según el rol del usuario autenticado
     * - Admin: todos los niveles con olimpistas
     * - Responsable: solo niveles de su área
     */
    public function listarPorAuth()
    {
        $user = auth()->user();

        if ($user->rol === 'admin') {
            return $this->listarTodosConOlimpistas();
        }

        $responsable = Responsable_Area::where('id_usuario', $user->id_usuario)->first();

        if (!$responsable) {
            return response()->json([
                'message' => 'El usuario no tiene un área asignada',
                'data' => []
            ], 404);
        }

        $area = Area::find($responsable->id_area);

        if (!$area) {
            return response()->json([
                'message' => 'Área no encontrada',
                'data' => []
            ], 404);
        }

        return $this->listarPorArea($area->nombre);
    }
}
