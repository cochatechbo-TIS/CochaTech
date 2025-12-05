<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Evaluacion;
use App\Models\Log_Cambio_Nota;
use Illuminate\Support\Facades\Auth;

class Log_Controller extends Controller
{
    public function updateNota(Request $request, $id_evaluacion)
    {
        $request->validate([
            'nota_nueva' => 'required|numeric|min:0|max:100',
            'motivo' => 'required|string|max:255',
        ]);

        $evaluacion = Evaluacion::with(['olimpista', 'nivelFase.nivel.area'])
            ->findOrFail($id_evaluacion);

        $usuario = Auth::user();

        $nombreEvaluador = trim($usuario->nombre . ' ' . ($usuario->apellidos ?? ''));
        $olimpista = $evaluacion->olimpista;
        $nombreEstudiante = trim($olimpista->nombre . ' ' . ($olimpista->apellidos ?? ''));

        if (!$olimpista) {
            return response()->json([
                'error' => 'El estudiante no tiene datos registrados'
            ], 500);
        }

        $notaAnterior = $evaluacion->nota;
        $notaNueva = $request->nota_nueva;

        $nivel = $evaluacion->nivelFase->nivel;
        $area = $nivel->area;


        Log_Cambio_Nota::create([
            'fecha'             => now()->toDateString(),
            'hora'              => now()->toTimeString(),
            'id_evaluador'      => $usuario->id_usuario,
            'nombre_evaluador'  => $nombreEvaluador,
            'id_area'           => $area->id_area,
            'nombre_area'       => $area->nombre,
            'id_nivel'          => $nivel->id_nivel,
            'nombre_nivel'      => $nivel->nombre,
            'id_estudiante'     => $olimpista->id_olimpista,
            'nombre_estudiante' => $nombreEstudiante,
            'nota_anterior'     => $notaAnterior,
            'nota_nueva'        => $notaNueva,
            'motivo'            => $request->motivo,
        ]);

        $evaluacion->nota = $notaNueva;
        $evaluacion->save();

        return response()->json([
            'mensaje' => 'Nota actualizada y log registrado correctamente'
        ], 200);
    }
}
