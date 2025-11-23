<?php

namespace App\Http\Controllers;

use App\Models\Evaluador;
use App\Models\Usuario;
use App\Models\Area;
use App\Models\Nivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\Fase; // <-- Añadir
use App\Models\Estado_Fase; // <-- Añadir
use Illuminate\Support\Facades\Auth;
use App\Models\Nivel_Fase;


class Evaluador_Controller extends Controller
{
    public function index()
    {
        $evaluadores = Evaluador::with(['usuario', 'area'])->get();

        $data = $evaluadores->map(function ($evaluador) {
            return [
                'id_usuario' => $evaluador->usuario->id_usuario,
                'nombre' => $evaluador->usuario->nombre,
                'apellidos' => $evaluador->usuario->apellidos,
                'ci' => $evaluador->usuario->ci,
                'email' => $evaluador->usuario->email,
                'telefono' => $evaluador->usuario->telefono,
                'area' => $evaluador->area->nombre,
                //'nivel' => $evaluador->nivel?->nombre,
                //'disponible' => $evaluador->disponible ?? true,
            ];
        });

        return response()->json([
            'message' => 'Lista de evaluadores recuperada correctamente',
            'data' => $data
        ]);
    }


    public function obtenerDatosIniciales(Request $request)
    {
        /** @var \App\Models\Usuario $user */
        $user = Auth::user();

        // 1. Encontrar el evaluador y su nivel asignado
        $evaluador = $user->evaluador;
        if (!$evaluador) {
            return response()->json(['message' => 'Usuario no es un evaluador.'], 403);
        }

        $nivelAsignado = Nivel::with('area')
                          ->where('id_evaluador', $evaluador->id_evaluador)
                          ->first();

        if (!$nivelAsignado) {
            return response()->json(['message' => 'Evaluador no tiene un nivel asignado.'], 404);
        }

        // 2. Construir el panel de Información
        $infoEvaluador = [
            'nombre_evaluador' => $user->nombre . ' ' . $user->apellidos,
            'nombre_nivel' => $nivelAsignado->nombre,
            'nombre_area' => $nivelAsignado->area->nombre,
            'id_nivel' => $nivelAsignado->id_nivel, // <-- ID Clave para futuras llamadas
            'es_grupal' => $nivelAsignado->es_grupal,
        ];

        // 3. Obtener la lista de Fases (Pestañas)
        // (Esto es lo que hace el nuevo Fase_Lista_Controller)
        try {
             $fases = Nivel_Fase::with(['fase', 'estado_fase'])
                ->where('id_nivel', $nivelAsignado->id_nivel)
                ->orderBy('id_nivel_fase', 'asc') // Asumiendo que el ID sigue el orden
                ->get()
                ->map(function ($nf) {
                    return [
                        'id_nivel_fase' => $nf->id_nivel_fase, // <-- ID Clave para la tabla
                        'nombre_fase'   => $nf->fase->nombre,
                        'orden'         => $nf->fase->orden,
                        'estado'        => $nf->estado_fase->nombre_estado ?? 'Desconocido',
                    ];
                });

             return response()->json([
                'infoEvaluador' => $infoEvaluador,
                'fases' => $fases
            ]);

        } catch (\Throwable $e) {
            Log::error("Error en obtenerDatosIniciales para evaluador {$user->id_usuario}: ".$e->getMessage());
            return response()->json(['message' => 'Error al cargar las fases.', 'error' => $e->getMessage()], 500);
        }
    }
}
