<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Evaluacion;

class MotivoEvaluacionController extends Controller
{

    public function updateMotivo(Request $request, $id_evaluacion)
    {
        $request->validate([
            'motivo_solicitado' => 'required|string|max:255',
        ]);

        $evaluacion = Evaluacion::findOrFail($id_evaluacion);

        $evaluacion->motivo_solicitado = $request->motivo_solicitado;
        $evaluacion->save();

        return response()->json([
            'mensaje' => 'Motivo actualizado correctamente',
            'evaluacion' => $evaluacion
        ], 200);
    }


    public function getMotivosPorNivelFase($id_nivel_fase)
    {
        $motivos = Evaluacion::select('id_evaluacion', 'motivo_solicitado')
            ->where('id_nivel_fase', $id_nivel_fase)
            ->whereNotNull('motivo_solicitado')
            ->get();

        return response()->json($motivos, 200);
    }

}
