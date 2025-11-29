<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Evaluador;
use App\Models\Nivel;

class Evaluador_Nivel_Controller  extends Controller
{
    public function obtenerNivelesEvaluador(Request $request)
    {
        // 1. Obtener usuario logueado
        $usuario = auth()->user();

        if (!$usuario) {
            return response()->json([
                'error' => 'Usuario no autenticado'
            ], 401);
        }

        // 2. Obtener su registro en evaluador
        $evaluador = $usuario->evaluador;

        if (!$evaluador) {
            return response()->json([
                'error' => 'El usuario no es evaluador'
            ], 404);
        }

        // 3. Obtener niveles del evaluador
        $niveles = Nivel::where('id_evaluador', $evaluador->id_evaluador)
                        ->select('id_nivel', 'nombre', 'es_grupal')
                        ->get();

        return response()->json([
            'evaluador' => $evaluador->id_evaluador,
            'niveles' => $niveles
        ]);
    }
}
