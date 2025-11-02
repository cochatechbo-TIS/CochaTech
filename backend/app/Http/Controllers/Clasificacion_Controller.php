<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Models\Estado_Olimpista;
use App\Models\Equipo;
use App\Models\Equipo_Olimpista;
use App\Models\Nivel_Fase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Clasificacion_Controller extends Controller
{
    public function registrarEvaluaciones(Request $request, $id_nivel_fase)
    {
        $request->validate([
            'evaluaciones' => 'required|array|min:1',
            'evaluaciones.*.id_evaluacion' => 'required|exists:evaluacion,id_evaluacion',
            'evaluaciones.*.nota' => 'required|numeric|min:0|max:100',
            'evaluaciones.*.comentario' => 'nullable|string',
            'evaluaciones.*.falta_etica' => 'required|boolean',
        ]);

        // Nota mínima configurable
        $notaMinima = 70;

        DB::beginTransaction();

        try {
            $nivelFase = Nivel_Fase::with(['fase', 'nivel.area'])->find($id_nivel_fase);

            if (!$nivelFase) {
                return response()->json(['error' => 'No se encontró el nivel_fase especificado.'], 404);
            }

            $fase = $nivelFase->fase;
            $nivel = $nivelFase->nivel;

            $resultados = [];

            foreach ($request->evaluaciones as $data) {
                $evaluacion = Evaluacion::with(['olimpista', 'equipo'])->find($data['id_evaluacion']);

                if (!$evaluacion) {
                    continue;
                }

                // Actualizar datos básicos
                $evaluacion->nota = $data['nota'];
                $evaluacion->comentario = $data['comentario'] ?? null;
                $evaluacion->falta_etica = $data['falta_etica'];

                // Determinar estado según reglas
                if ($data['falta_etica']) {
                    $estado = 'Desclasificado';
                } elseif ($data['nota'] >= $notaMinima) {
                    $estado = 'Clasificado';
                } else {
                    $estado = 'No Clasificado';
                }

                // Buscar id_estado_olimpista correspondiente
                $estadoOlimpista = Estado_Olimpista::where('nombre', $estado)->first();
                if (!$estadoOlimpista) {
                    throw new \Exception("No existe el estado '$estado' en la tabla estado_olimpista");
                }

                $evaluacion->id_estado_olimpista = $estadoOlimpista->id_estado_olimpista;
                $evaluacion->save();

                //Armar respuesta según tipo
                if ($evaluacion->id_olimpista) {
                    //Individual
                    $resultados[] = [
                        'id_evaluacion' => $evaluacion->id_evaluacion,
                        'nombre' => $evaluacion->olimpista->nombre,
                        'apellidos' => $evaluacion->olimpista->apellidos,
                        'ci' => $evaluacion->olimpista->ci,
                        'institucion' => $evaluacion->olimpista->institucion,
                        'nota' => $evaluacion->nota,
                        'falta_etica' => $evaluacion->falta_etica,
                        'observaciones' => $evaluacion->comentario,
                        'estado_olimpista' => $estado,
                    ];
                } elseif ($evaluacion->id_equipo) {
                    // Grupal
                    $equipo = $evaluacion->equipo;

                    // Obtener instituciones de los integrantes
                    $instituciones = Equipo_Olimpista::join('olimpista', 'olimpista.id_olimpista', '=', 'equipo_olimpista.id_olimpista')
                        ->where('equipo_olimpista.id_equipo', $equipo->id_equipo)
                        ->pluck('olimpista.institucion')
                        ->unique();

                    $institucion = $instituciones->count() === 1 ? $instituciones->first() : null;

                    $resultados[] = [
                        'id_evaluacion' => $evaluacion->id_evaluacion,
                        'id_equipo' => $equipo->id_equipo,
                        'nombre_equipo' => $equipo->nombre_equipo,
                        'institucion' => $institucion,
                        'nota' => $evaluacion->nota,
                        'falta_etica' => $evaluacion->falta_etica,
                        'observaciones' => $evaluacion->comentario,
                        'estado_olimpista' => $estado,
                    ];
                }
            }

            DB::commit();

            //Estructura final según tipo
            if ($nivel->es_grupal) {
                $respuesta = [
                    'fase' => $fase->nombre,
                    'id_nivel_fase' => $nivelFase->id_nivel_fase,
                    'nivel' => $nivel->nombre,
                    'area' => $nivel->area->nombre,
                    'tipo' => 'grupal',
                    'equipos' => $resultados
                ];
            } else {
                $respuesta = [
                    'fase' => $fase->nombre,
                    'id_nivel_fase' => $nivelFase->id_nivel_fase,
                    'nivel' => $nivel->nombre,
                    'area' => $nivel->area->nombre,
                    'tipo' => 'individual',
                    'resultados' => $resultados
                ];
            }

            //return response()->json($respuesta, 200);
            return response()->json([
                "message" => "clasificasion hecha correctamente"
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al registrar las evaluaciones.',
                'detalle' => $e->getMessage(),
            ], 500);
        }
    }
}
