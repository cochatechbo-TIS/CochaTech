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
            ->map(function ($n) use ($conteos, $totalFases, $area) {
                $fasesAprobadas = DB::table('nivel_fase as nf')
                    ->join('estado_fase as ef', 'ef.id_estado_fase', '=', 'nf.id_estado_fase')
                    ->where('nf.id_nivel', $n->id_nivel)
                    ->where('ef.nombre_estado', 'Aprobada')  
                    ->count();
                return [
                    'id' => $n->id_nivel,
                    'nombre' => $n->nombre,
                    'competidores' => $conteos[$n->id_nivel]->total ?? 0,
                    'fasesAprobadas' => $fasesAprobadas,         // temporal (por ahora en cero)
                    'faseTotales' => $totalFases,
                    'evaluador' => $n->evaluador?->usuario?->nombre . ' ' . $n->evaluador?->usuario?->apellidos ?? '', //  MODIFICACIÓN: Usar nombre y apellidos del usuario
                    'area' => $area->nombre,
                    'id_area' => $area->id_area,//agregado para usar en /evaluadores-por-area/
                ];
            })
            ->values();

        return response()->json([
            'message' => "Niveles del área '{$nombre_area}' listados correctamente (solo con olimpistas)",
            'data' => $resultado
        ]);
    }

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
