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
            ->map(function ($n) use ($conteos) {
                return [
                    'id_nivel' => $n->id_nivel,
                    'nombre_nivel' => $n->nombre,
                    'cantidad_olimpistas' => $conteos[$n->id_nivel]->total ?? 0,
                    'evaluador' => $n->evaluador?->nombre_completo ?? '',
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

    /**
     * Para admin: todos los niveles de todas las áreas con olimpistas
     */
    public function listarTodosConOlimpistas()
    {
        $conteos = Importar_Olimpista::select('id_area', 'id_nivel', DB::raw('COUNT(*) as total'))
            ->groupBy('id_area', 'id_nivel')
            ->get();

        $niveles = Nivel::with(['area', 'evaluador'])->get();

        $resultado = $niveles->filter(function ($nivel) use ($conteos) {
            return $conteos->contains(fn($c) => 
                $c->id_area == $nivel->id_area && $c->id_nivel == $nivel->id_nivel
            );
        })->map(function ($nivel) use ($conteos) {
            $conteo = $conteos->firstWhere('id_nivel', $nivel->id_nivel);
            return [
                'nombre_area' => $nivel->area->nombre,
                'id_nivel' => $nivel->id_nivel,
                'nombre_nivel' => $nivel->nombre,
                'cantidad_olimpistas' => $conteo->total ?? 0,
                'evaluador' => $nivel->evaluador?->nombre_completo ?? '',
            ];
        })->values();

        return response()->json([
            'message' => 'Listado de niveles con olimpistas por área (admin)',
            'data' => $resultado
        ]);
    }
}
