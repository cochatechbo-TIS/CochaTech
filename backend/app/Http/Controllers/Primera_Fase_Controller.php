<?php

namespace App\Http\Controllers;

use App\Models\Nivel;
use App\Models\Fase;
use App\Models\Nivel_Fase;
use App\Models\Evaluacion;
use App\Models\Olimpista;
use App\Models\Equipo_Olimpista;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Primera_Fase_Controller extends Controller
{
    public function crearPrimeraFase($idNivelSeleccionado)
    {
        DB::beginTransaction();

        try {
            // Obtener la primera fase (orden = 1)
            $fase = Fase::where('orden', 1)->first();

            if (!$fase) {
                return response()->json(['error' => 'No existe una fase con orden 1.'], 404);
            }

            // Crear registros en nivel_fase si no existen
            $niveles = Nivel::all();
            foreach ($niveles as $nivel) {
                Nivel_Fase::firstOrCreate(
                    [
                        'id_fase' => $fase->id_fase,
                        'id_nivel' => $nivel->id_nivel
                    ],
                    [
                        'id_estado_fase' => 1
                    ]
                );
            }

            // Crear evaluaciones
            $nivelesConOlimpistas = Nivel::with('olimpistas')->get();

            foreach ($nivelesConOlimpistas as $nivel) {
                $nivelFase = Nivel_Fase::where('id_fase', $fase->id_fase)
                    ->where('id_nivel', $nivel->id_nivel)
                    ->first();

                if ($nivel->es_grupal) {
                    //  Si es grupal una evaluación por equipo
                    $equipos = Equipo::where('id_nivel', $nivel->id_nivel)->get();
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
                    // Si es individual una evaluación por olimpista
                    foreach ($nivel->olimpistas as $olimpista) {
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
            }

            //  Obtener nivel y nivel_fase seleccionados
            $nivelSeleccionado = Nivel::with('area')->find($idNivelSeleccionado);
            if (!$nivelSeleccionado) {
                return response()->json(['error' => 'No se encontró el nivel indicado.'], 404);
            }

            $nivelFaseSeleccionado = Nivel_Fase::where('id_fase', $fase->id_fase)
                ->where('id_nivel', $idNivelSeleccionado)
                ->first();

            if (!$nivelFaseSeleccionado) {
                return response()->json(['error' => 'No se encontró la fase para el nivel indicado.'], 404);
            }

            // Armar respuesta dinámica
            if ($nivelSeleccionado->es_grupal) {
                // ------------------ GRUPAL ------------------
                $equipos = Equipo::where('id_nivel', $idNivelSeleccionado)
                    ->get()
                    ->map(function ($equipo) use ($nivelFaseSeleccionado) {
                        $evaluacion = Evaluacion::where('id_equipo', $equipo->id_equipo)
                            ->where('id_nivel_fase', $nivelFaseSeleccionado->id_nivel_fase)
                            ->first();

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
                    });

                $respuesta = [
                    'fase' => $fase->nombre,
                    'id_nivel_fase' => $nivelFaseSeleccionado->id_nivel_fase,
                    'nivel' => $nivelSeleccionado->nombre,
                    'area' => $nivelSeleccionado->area->nombre,
                    'tipo' => 'grupal',
                    'equipos' => $equipos
                ];
            } else {
                // ------------------ INDIVIDUAL ------------------
                $evaluaciones = Evaluacion::with('olimpista')
                    ->where('id_nivel_fase', $nivelFaseSeleccionado->id_nivel_fase)
                    ->get()
                    ->map(function ($evaluacion) {
                        $o = $evaluacion->olimpista;
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
                    });

                $respuesta = [
                    'fase' => $fase->nombre,
                    'id_nivel_fase' => $nivelFaseSeleccionado->id_nivel_fase,
                    'nivel' => $nivelSeleccionado->nombre,
                    'area' => $nivelSeleccionado->area->nombre,
                    'tipo' => 'individual',
                    'resultados' => $evaluaciones
                ];
            }

            DB::commit();
            //return response()->json($respuesta, 201);
            return response()->json([
                "message" => "Primera fase creada correctamente"
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al generar la primera fase',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }
}
