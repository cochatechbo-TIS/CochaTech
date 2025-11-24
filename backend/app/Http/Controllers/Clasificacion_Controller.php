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

    DB::beginTransaction();

    try {
        // Cargar nivel_fase con sus relaciones
        $nivelFase = Nivel_Fase::with(['fase', 'nivel.area'])->find($id_nivel_fase);

        if (!$nivelFase) {
            return response()->json(['error' => 'No se encontró el nivel_fase especificado.'], 404);
        }

        $fase  = $nivelFase->fase;
        $nivel = $nivelFase->nivel;


        //  NOTA MiNIMA — CORREGIDO

        $notaMinima = isset($fase->nota_minima)
            ? (float) $fase->nota_minima
            : 0;

        $resultados = [];

        foreach ($request->evaluaciones as $data) {

            $evaluacion = Evaluacion::with(['olimpista', 'equipo'])
                ->find($data['id_evaluacion']);

            if (!$evaluacion) {
                continue;
            }

            // Actualizar datos
            $evaluacion->nota = $data['nota'];
            $evaluacion->comentario = $data['comentario'] ?? null;
            $evaluacion->falta_etica = $data['falta_etica'];


            if ($data['falta_etica']) {
                $estado = 'Desclasificado';
            } elseif ((float)$data['nota'] >= $notaMinima) {
                $estado = 'Clasificado';
            } else {
                $estado = 'No Clasificado';
            }

            // Buscar ID estado
            $estadoOlimpista = Estado_Olimpista::where('nombre', $estado)->first();
            if (!$estadoOlimpista) {
                throw new \Exception("No existe el estado '$estado' en la tabla estado_olimpista");
            }

            $evaluacion->id_estado_olimpista = $estadoOlimpista->id_estado_olimpista;
            $evaluacion->save();

 
            if ($evaluacion->id_olimpista) {

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

                $equipo = $evaluacion->equipo;

                $instituciones = Equipo_Olimpista::join(
                    'olimpista',
                    'olimpista.id_olimpista',
                    '=',
                    'equipo_olimpista.id_olimpista'
                )
                    ->where('equipo_olimpista.id_equipo', $equipo->id_equipo)
                    ->pluck('olimpista.institucion')
                    ->unique();

                $institucion = $instituciones->count() === 1
                    ? $instituciones->first()
                    : null;

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

        return response()->json([
            "message" => "clasificación hecha correctamente"
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
