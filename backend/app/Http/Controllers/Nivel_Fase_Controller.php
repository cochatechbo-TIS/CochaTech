<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Nivel_Fase;

class Nivel_Fase_Controller extends Controller
{

    public function rechazar(Request $request, $id)
    {
        $request->validate([
            'comentario' => 'required|string|max:500',
        ]);

        $nivelFase = Nivel_Fase::findOrFail($id);
        $nivelFase->id_estado_fase = 3; // Rechazada
        $nivelFase->comentario = $request->comentario;
        $nivelFase->save();

        return response()->json([
            'message' => 'Nivel de fase rechazado correctamente.',
            'data' => $nivelFase
        ], 200);
    }

    
    public function aprobar($id)
    {
        $nivelFase = Nivel_Fase::findOrFail($id);
        $nivelFase->id_estado_fase = 2; 
        $nivelFase->comentario = null; // Limpiar comentario opcionalmente
        $nivelFase->save();

        return response()->json([
            'message' => 'Nivel de fase aprobada correctamente.',
            'data' => $nivelFase
        ], 200);
    }

    public function mostrar($id)
    {
        $nivelFase = DB::table('nivel_fase')
            ->join('estado_fase', 'nivel_fase.id_estado_fase', '=', 'estado_fase.id_estado_fase')
            ->select('nivel_fase.id_nivel_fase', 'estado_fase.nombre_estado', 'nivel_fase.comentario')
            ->where('nivel_fase.id_nivel_fase', $id)
            ->first();

        if (!$nivelFase) {
            return response()->json(['message' => 'Nivel de fase no encontrado'], 404);
        }

        return response()->json($nivelFase, 200);
    }
}

