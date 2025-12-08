<?php

namespace App\Http\Controllers;

use App\Models\Olimpista;
use App\Models\Responsable_Area;
use App\Models\Evaluador;
use App\Models\Area;
use App\Models\Nivel_Fase;
use Illuminate\Http\Request;

class Logistica_Controller extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // admin
        if ($user->id_rol == 1) { 
            return response()->json([
                'total_olimpistas'   => Olimpista::count(),
                'total_responsables' => Responsable_Area::count(),
                'total_evaluadores'  => Evaluador::count(),
                'total_areas'        => Area::count(),
                'fases_en_proceso'   => Nivel_Fase::count()
            ]);
        }

        // responsable
        if ($user->id_rol == 2) { 
            $responsable = $user->responsable;

            if(!$responsable){
                return response()->json(['error' => 'El usuario no es responsable de un área'], 400);
            }

            $idArea = $responsable->id_area;

            return response()->json([
                'olimpistas_en_area' => Olimpista::where('id_area', $idArea)->count(),

                'fases_aprobadas_area' => Nivel_Fase::whereHas('estado_fase', function($q){
                    $q->where('nombre_estado', 'Aprobada');
                })
                ->whereIn('id_nivel', function($query) use ($idArea){
                    $query->select('id_nivel')
                          ->from('olimpista')
                          ->where('id_area', $idArea);
                })
                ->count(),

                'total_fases_area' => Nivel_Fase::whereIn('id_nivel', function($query) use ($idArea){
                    $query->select('id_nivel')
                          ->from('olimpista')
                          ->where('id_area', $idArea);
                })->count(),

                'evaluadores_en_area' => Evaluador::where('id_area', $idArea)->count()
            ]);
        }

        // evaluador
        if ($user->id_rol == 3) { 
            $evaluador = $user->evaluador;

            if(!$evaluador){
                return response()->json(['error' => 'El usuario no es evaluador'], 400);
            }

            // 1. Obtener TODOS los niveles asignados al evaluador
            $nivelesAsignados = \App\Models\Nivel::where('id_evaluador', $evaluador->id_evaluador)->pluck('id_nivel');

            return response()->json([
                
                // Total niveles asignados a este evaluador
                'total_niveles_asignados' => $nivelesAsignados->count(),

                // Fases–Nivel EN PROCESO en esos niveles
                'fases_nivel_en_proceso' => Nivel_Fase::whereIn('id_nivel', $nivelesAsignados)
                    ->whereHas('estado_fase', function($q){
                        $q->where('nombre_estado', 'En Proceso');
                    })
                    ->count(),

                // Fases–Nivel APROBADAS en esos niveles
                'fases_nivel_aprobadas' => Nivel_Fase::whereIn('id_nivel', $nivelesAsignados)
                    ->whereHas('estado_fase', function($q){
                        $q->where('nombre_estado', 'Aprobada');
                    })
                    ->count(),
            ]);
        }


        return response()->json(['error' => 'Rol no reconocido'], 400);
    }
}
