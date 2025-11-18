<?php

namespace App\Http\Controllers;

use App\Models\Evaluador;
use App\Models\Nivel;
use Illuminate\Http\Request;

class Nivel_Evaluador extends Controller
{

    public function evaluadoresPorArea($id_area)
    {
        // Traer evaluadores junto con datos del usuario
        $evaluadores = Evaluador::where('id_area', $id_area)
            ->join('usuario', 'evaluador.id_usuario', '=', 'usuario.id_usuario')
            ->select(
                'evaluador.id_evaluador',
                'usuario.nombre',
                'usuario.apellidos'
            )
            ->get();

        return response()->json($evaluadores);
    }

     public function asignarEvaluador(Request $request)
    {
        $request->validate([
            'id_nivel'      => 'required|exists:nivel,id_nivel',
            'id_evaluador'  => 'required|exists:evaluador,id_evaluador',
        ]);


        $nivel = Nivel::findOrFail($request->id_nivel);

        $nivel->id_evaluador = $request->id_evaluador;
        $nivel->save();

        return response()->json([
            'message' => 'Evaluador asignado correctamente al nivel.',
            'nivel'   => $nivel,
        ]);
    }
}
