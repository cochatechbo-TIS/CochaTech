<?php

namespace App\Http\Controllers;

use App\Models\Nivel_Fase;
use App\Models\Fase;
use App\Models\Evaluacion;
use Illuminate\Http\Request;

class Fase_Consulta_Controller extends Controller
{
    /**
     * Devuelve la información y resultados de una fase existente.
     */
    public function mostrarFase($idNivelFase)
    {
        $nivelFase = Nivel_Fase::with(['fase', 'nivel.area'])->find($idNivelFase);

        if (!$nivelFase) {
            return response()->json(['error' => 'No se encontró la fase solicitada.'], 404);
        }

        $fase = $nivelFase->fase;
        $nivel = $nivelFase->nivel;
        $esFaseFinal = ($fase->orden == Fase::max('orden'));

        if ($nivel->es_grupal) {
            $equipos = Evaluacion::with(['equipo', 'estadoOlimpista'])
                ->where('id_nivel_fase', $nivelFase->id_nivel_fase)
                ->get()
                ->map(function ($evaluacion) {
                    $e = $evaluacion->equipo;
                    return [
                        'id_evaluacion' => $evaluacion->id_evaluacion,
                        'id_equipo' => $e->id_equipo,
                        'nombre_equipo' => $e->nombre_equipo,
                        'institucion' => $e->institucion,
                        'nota' => $evaluacion->nota,
                        'falta_etica' => $evaluacion->falta_etica,
                        'observaciones' => $evaluacion->comentario,
                        'estado_olimpista' => $evaluacion->estadoOlimpista->nombre ?? null
                    ];
                });

            return response()->json([
                'fase' => $fase->nombre,
                'id_nivel_fase' => $nivelFase->id_nivel_fase,
                'nivel' => $nivel->nombre,
                'area' => $nivel->area->nombre,
                'tipo' => 'grupal',
                'es_Fase_final' => $esFaseFinal,
                'equipos' => $equipos
            ]);
        } else {
            $resultados = Evaluacion::with(['olimpista', 'estadoOlimpista'])
                ->where('id_nivel_fase', $nivelFase->id_nivel_fase)
                ->get()
                ->map(function ($evaluacion) {
                    $o = $evaluacion->olimpista;
                    return [
                        'id_evaluacion' => $evaluacion->id_evaluacion,
                        'nombre' => $o->nombre,
                        'apellidos' => $o->apellidos,
                        'ci' => $o->ci,
                        'institucion' => $o->institucion,
                        'nota' => $evaluacion->nota,
                        'falta_etica' => $evaluacion->falta_etica,
                        'observaciones' => $evaluacion->comentario,
                        'estado_olimpista' => $evaluacion->estadoOlimpista->nombre ?? null
                    ];
                });

            return response()->json([
                'fase' => $fase->nombre,
                'id_nivel_fase' => $nivelFase->id_nivel_fase,
                'nivel' => $nivel->nombre,
                'area' => $nivel->area->nombre,
                'tipo' => 'individual',
                'es_Fase_final' => $esFaseFinal,
                'resultados' => $resultados
            ]);
        }
    }
}


