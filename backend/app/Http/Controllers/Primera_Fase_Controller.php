<?php

namespace App\Http\Controllers;

use App\Models\Nivel;
use App\Models\Fase;
use App\Models\Nivel_Fase;
use App\Models\Evaluacion;
use App\Models\Equipo;
use Illuminate\Support\Facades\DB;

class Primera_Fase_Controller extends Controller
{
    public function generarYObtenerPrimeraFase($idNivel)
    {
        DB::beginTransaction();

        try {
            // Obtener fase orden 1
            $fase = Fase::where('orden', 1)->firstOrFail();

            // Obtener todos los niveles (para crear toda la fase)
            $niveles = Nivel::with('olimpistas')->get();

            // 1. CREAR TODA LA FASE (si no existe)
            foreach ($niveles as $nivel) {

                // Crear nivel_fase
                $nivelFase = Nivel_Fase::firstOrCreate(
                    [
                        'id_fase' => $fase->id_fase,
                        'id_nivel' => $nivel->id_nivel
                    ],
                    [
                        'id_estado_fase' => 1
                    ]
                );

                // Crear evaluaciones dependiendo del tipo
                if ($nivel->es_grupal) {
                    $equipos = Equipo::where('id_nivel', $nivel->id_nivel)->get();

                    foreach ($equipos as $equipo) {
                        Evaluacion::firstOrCreate(
                            [
                                'id_equipo' => $equipo->id_equipo,
                                'id_nivel_fase' => $nivelFase->id_nivel_fase
                            ],
                            [
                                'nota' => null,
                                'comentario' => null,
                                'falta_etica' => false,
                                'id_olimpista' => null
                            ]
                        );
                    }
                } else {
                    foreach ($nivel->olimpistas as $olimpista) {
                        Evaluacion::firstOrCreate(
                            [
                                'id_olimpista' => $olimpista->id_olimpista,
                                'id_nivel_fase' => $nivelFase->id_nivel_fase
                            ],
                            [
                                'nota' => null,
                                'comentario' => null,
                                'falta_etica' => false,
                                'id_equipo' => null
                            ]
                        );
                    }
                }
            }

            // Hasta aquí se creó TODA la fase correctamente
            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "error" => "Error al generar la fase",
                "detalle" => $e->getMessage()
            ], 500);
        }

        // 2. AHORA SOLO DEVUELVE EL NIVEL SELECCIONADO
        try {

            $nivel = Nivel::with('area', 'olimpistas')->findOrFail($idNivel);

            $nivelFase = Nivel_Fase::where('id_fase', $fase->id_fase)
                ->where('id_nivel', $idNivel)
                ->firstOrFail();

            if ($nivel->es_grupal) {

                $equipos = Equipo::where('id_nivel', $idNivel)
                    ->get()
                    ->map(function ($equipo) use ($nivelFase) {

                        $ev = Evaluacion::where('id_equipo', $equipo->id_equipo)
                            ->where('id_nivel_fase', $nivelFase->id_nivel_fase)
                            ->first();

                        return [
                            'id_equipo'    => $equipo->id_equipo,
                            'nombre_equipo'=> $equipo->nombre_equipo,
                            'institucion'  => $equipo->institucion,
                            'nota'         => $ev->nota,
                            'falta_etica'  => $ev->falta_etica,
                            'observaciones'=> $ev->comentario
                        ];
                    });

                return response()->json([
                    'fase'          => $fase->nombre,
                    'tipo'          => 'grupal',
                    'nivel'         => $nivel->nombre,
                    'area'          => $nivel->area->nombre,
                    'resultados'    => $equipos
                ], 200);

            } else {

                $evaluaciones = Evaluacion::with('olimpista')
                    ->where('id_nivel_fase', $nivelFase->id_nivel_fase)
                    ->get()
                    ->map(function ($ev) {
                        $o = $ev->olimpista;

                        return [
                            'nombre'       => $o->nombre,
                            'apellidos'    => $o->apellidos,
                            'ci'           => $o->ci,
                            'institucion'  => $o->institucion,
                            'nota'         => $ev->nota,
                            'falta_etica'  => $ev->falta_etica,
                            'observaciones'=> $ev->comentario
                        ];
                    });

                return response()->json([
                    'fase'       => $fase->nombre,
                    'tipo'       => 'individual',
                    'nivel'      => $nivel->nombre,
                    'area'       => $nivel->area->nombre,
                    'resultados' => $evaluaciones
                ], 200);
            }

        } catch (\Exception $e) {
            return response()->json([
                "error" => "Error al obtener datos del nivel",
                "detalle" => $e->getMessage()
            ], 500);
        }
    }
}
