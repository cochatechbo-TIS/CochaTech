<?php

namespace App\Http\Controllers;

use App\Models\Nivel;
use App\Models\Fase;
use App\Models\Nivel_Fase;
use App\Models\Evaluacion;
use App\Models\Olimpista;
use App\Models\Equipo;
use App\Models\Estado_Olimpista;
use Illuminate\Support\Facades\DB;

class Fase_Dinamico_Controller extends Controller
{

    public function crearSiguienteFase($idNivelSeleccionado)
    {
        DB::beginTransaction();

        try {
            // Buscar el nivel
            $nivelSeleccionado = Nivel::with('area')->find($idNivelSeleccionado);
            if (!$nivelSeleccionado) {
                return response()->json(['error' => 'No se encontró el nivel indicado.'], 404);
            }

            // Buscar la última fase asociada al nivel
            $ultimaFase = Nivel_Fase::where('id_nivel', $idNivelSeleccionado)
                ->join('fase', 'nivel_fase.id_fase', '=', 'fase.id_fase')
                ->select('fase.*', 'nivel_fase.id_nivel_fase')
                ->orderBy('fase.orden', 'desc')
                ->first();

            // Si no hay fase previa → empezamos desde la fase 1
            $ordenSiguiente = $ultimaFase ? $ultimaFase->orden + 1 : 1;

            // Validar que todos los olimpistas de la fase anterior estén clasificados
            if ($ultimaFase) {
                $faltanClasificar = Evaluacion::where('id_nivel_fase', $ultimaFase->id_nivel_fase)
                    ->whereNull('id_estado_olimpista')
                    ->exists();

                if ($faltanClasificar) {
                    return response()->json([
                        'error' => 'Faltan clasificar a algunos participantes antes de generar la siguiente fase.'
                    ], 400);
                }
            }

            // Obtener la siguiente fase
            $fase = Fase::where('orden', $ordenSiguiente)->first();
            if (!$fase) {
                return response()->json(['error' => 'No hay más fases disponibles.'], 404);
            }


            // Cambiar estado de la fase anterior (si existe)
            if ($ultimaFase) {
                Nivel_Fase::where('id_nivel_fase', $ultimaFase->id_nivel_fase)
                    ->update(['id_estado_fase' => 2]); // 2 = Aprobada
            }

            //  Crear o recuperar el registro de nivel_fase
            $nivelFase = Nivel_Fase::firstOrCreate(
                [
                    'id_fase' => $fase->id_fase,
                    'id_nivel' => $idNivelSeleccionado
                ],
                [
                    'id_estado_fase' => 1 // 1 = En curso
                ]
            );

            // Filtrar "Clasificados" desde la fase anterior
            $estadoClasificado = Estado_Olimpista::where('nombre', 'Clasificado')->first();

            if ($nivelSeleccionado->es_grupal) {
                // Grupal: obtener equipos clasificados
                if ($ultimaFase) {
                    $evaluacionesPrevias = Evaluacion::where('id_nivel_fase', $ultimaFase->id_nivel_fase)
                        ->where('id_estado_olimpista', $estadoClasificado->id_estado_olimpista)
                        ->whereNotNull('id_equipo')
                        ->pluck('id_equipo');
                } else {
                    // Si es la primera fase, todos los equipos entran
                    $evaluacionesPrevias = Equipo::where('id_nivel', $idNivelSeleccionado)->pluck('id_equipo');
                }

                $equipos = Equipo::whereIn('id_equipo', $evaluacionesPrevias)->get();

                foreach ($equipos as $equipo) {
                    Evaluacion::firstOrCreate(
                        [
                            'id_equipo' => $equipo->id_equipo,
                            'id_nivel_fase' => $nivelFase->id_nivel_fase,
                        ],
                        [
                            'nota' => null,
                            'comentario' => null,
                            'falta_etica' => false,
                        ]
                    );
                }

            } else {
                //  Individual: obtener olimpistas clasificados
                if ($ultimaFase) {
                    $evaluacionesPrevias = Evaluacion::where('id_nivel_fase', $ultimaFase->id_nivel_fase)
                        ->where('id_estado_olimpista', $estadoClasificado->id_estado_olimpista)
                        ->whereNotNull('id_olimpista')
                        ->pluck('id_olimpista');
                } else {
                    // Si es la primera fase, todos los olimpistas entran
                    $evaluacionesPrevias = Olimpista::where('id_nivel', $idNivelSeleccionado)->pluck('id_olimpista');
                }

                $olimpistas = Olimpista::whereIn('id_olimpista', $evaluacionesPrevias)->get();

                foreach ($olimpistas as $olimpista) {
                    Evaluacion::firstOrCreate(
                        [
                            'id_olimpista' => $olimpista->id_olimpista,
                            'id_nivel_fase' => $nivelFase->id_nivel_fase,
                        ],
                        [
                            'nota' => null,
                            'comentario' => null,
                            'falta_etica' => false,
                            'id_equipo' => null,
                        ]
                    );
                }
            }

            //  Determinar si es fase final
            $ultimaOrden = Fase::max('orden');
            $esFaseFinal = ($fase->orden == $ultimaOrden);

            //  Armar respuesta completa
            if ($nivelSeleccionado->es_grupal) {
                $equipos = Equipo::where('id_nivel', $idNivelSeleccionado)
                    ->get()
                    ->map(function ($equipo) use ($nivelFase) {
                        $evaluacion = Evaluacion::with('estadoOlimpista')
                            ->where('id_equipo', $equipo->id_equipo)
                            ->where('id_nivel_fase', $nivelFase->id_nivel_fase)
                            ->first();

                        if (!$evaluacion) return null; // evitar equipos no clasificados

                        return [
                            'id_evaluacion' => $evaluacion->id_evaluacion ?? null,
                            'id_equipo' => $equipo->id_equipo,
                            'nombre_equipo' => $equipo->nombre_equipo,
                            'institucion' => $equipo->institucion,
                            'nota' => $evaluacion->nota ?? null,
                            'falta_etica' => $evaluacion->falta_etica ?? false,
                            'observaciones' => $evaluacion->comentario ?? null,
                            'estado_olimpista' => $evaluacion->estadoOlimpista->nombre ?? null
                        ];
                    })->filter();

                $respuesta = [
                    'message' => "Fase {$fase->orden} generada correctamente.",
                    'es_Fase_final' => $esFaseFinal,
                    'fase' => $fase->nombre,
                    'id_fase' => $fase->id_fase,
                    'id_nivel_fase' => $nivelFase->id_nivel_fase,
                    'nivel' => $nivelSeleccionado->nombre,
                    'area' => $nivelSeleccionado->area->nombre,
                    'tipo' => 'grupal',
                    'equipos' => $equipos->values()
                ];
            } else {
                $evaluaciones = Evaluacion::with(['olimpista', 'estadoOlimpista'])
                    ->where('id_nivel_fase', $nivelFase->id_nivel_fase)
                    ->get()
                    ->map(function ($evaluacion) {
                        $o = $evaluacion->olimpista;
                        if (!$o) return null;
                        return [
                            'id_evaluacion' => $evaluacion->id_evaluacion ?? null,
                            'nombre' => $o->nombre,
                            'apellidos' => $o->apellidos,
                            'ci' => $o->ci,
                            'institucion' => $o->institucion,
                            'nota' => $evaluacion->nota ?? null,
                            'falta_etica' => $evaluacion->falta_etica ?? false,
                            'observaciones' => $evaluacion->comentario ?? null,
                            'estado_olimpista' => $evaluacion->estadoOlimpista->nombre ?? null
                        ];
                    })->filter();

                $respuesta = [
                    'message' => "Fase {$fase->orden} generada correctamente.",
                    'es_Fase_final' => $esFaseFinal,
                    'fase' => $fase->nombre,
                    'id_fase' => $fase->id_fase,
                    'id_nivel_fase' => $nivelFase->id_nivel_fase,
                    'nivel' => $nivelSeleccionado->nombre,
                    'area' => $nivelSeleccionado->area->nombre,
                    'tipo' => 'individual',
                    'resultados' => $evaluaciones->values()
                ];
            }

            DB::commit();
            //return response()->json($respuesta, 201);////////////////////////////////////////////////////////////////
            return response()->json([
                "message" => "fase creada correctamente"
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al generar la siguiente fase',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }
}
