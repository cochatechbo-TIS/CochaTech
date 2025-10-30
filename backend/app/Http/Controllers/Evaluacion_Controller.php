<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Usuario;
use App\Models\Evaluador;
use App\Models\Nivel;
use App\Models\Fase;
use App\Models\Nivel_Fase;
use App\Models\Olimpista;
use App\Models\Evaluacion;
use App\Models\Estado_Olimpista;
use App\Models\Estado_Fase;

class Evaluacion_Controller extends Controller
{
/**
     * Función helper para obtener los datos clave del evaluador autenticado.
     * Esto centraliza la lógica y evita errores.
     */
    private function getEvaluadorData()
    {
        /** @var \App\Models\Usuario $user */
        $user = Auth::user();

        // 1. Verificar si el usuario tiene la relación 'evaluador'
        $evaluador = $user->evaluador; // Esto usa la relación hasOne()

        if (!$evaluador) {
            Log::warning("getEvaluadorData - No se encontró registro 'evaluador' para Usuario ID: {$user->id_usuario}");
            return null;
        }

        // 2. Buscar el nivel asignado a ESE evaluador
        $nivelAsignado = Nivel::where('id_evaluador', $evaluador->id_evaluador)->first();

        if (!$nivelAsignado) {
            Log::warning("getEvaluadorData - Se encontró evaluador (ID: {$evaluador->id_evaluador}), pero no tiene nivel asignado en la tabla 'nivel'.");
            return null;
        }

        // 3. Devolver todos los datos que necesitamos
        // --- INICIO DE CORRECCIÓN LÓGICA ---
        // El 'id_area' AHORA viene del nivel asignado, no del evaluador.
        // Esto asegura que el nivel y el área siempre coincidan.
        return [
            'evaluador'    => $evaluador,              // El modelo Evaluador
            'nivel'        => $nivelAsignado,          // El modelo Nivel
            'id_usuario'   => $user->id_usuario,
            'id_evaluador' => $evaluador->id_evaluador,
            'id_nivel'     => $nivelAsignado->id_nivel,
            'id_area'      => $nivelAsignado->id_area, // <-- CORREGIDO
        ];
        // --- FIN DE CORRECCIÓN LÓGICA ---
    }

    /**
     * Obtener las fases asignadas al nivel del evaluador autenticado.
     */
    public function obtenerFases(Request $request)
    {
        // --- INICIO DE CORRECCIÓN ---
        $evaluadorData = $this->getEvaluadorData();

        if (!$evaluadorData) {
            // El error viene de la función helper
            return response()->json([
                'message' => 'No se pudieron cargar las fases. ¿Eres un evaluador con un nivel asignado?'
            ], 403); // 403 Forbidden
        }

        $idNivelDelEvaluador = $evaluadorData['id_nivel'];
        $idUsuarioAutenticado = $evaluadorData['id_usuario'];
        // --- FIN DE CORRECCIÓN ---

        try {
            // Buscamos las fases relacionadas a ESE nivel
            $fases = Fase::whereHas('nivel_fases', function ($query) use ($idNivelDelEvaluador) {
                $query->where('id_nivel', $idNivelDelEvaluador);
            })
            ->with(['nivel_fases' => function ($query) use ($idNivelDelEvaluador) {
                $query->where('id_nivel', $idNivelDelEvaluador)->with('estado_fase');
            }])
            ->orderBy('id_fase')
            ->get();

             // Formatear respuesta
             $resultadoFases = $fases->map(function ($fase) use ($idNivelDelEvaluador) {
                 $nivelFaseInfo = $fase->nivel_fases->firstWhere('id_nivel', $idNivelDelEvaluador);
                 return [
                     'id' => $fase->id_fase, 
                     'nombre' => $fase->nombre,
                     'estado' => $nivelFaseInfo?->estado_fase?->nombre ?? 'Desconocido',
                 ];
             });

            return response()->json($resultadoFases);

        } catch (\Throwable $e) {
            Log::error("Error en Evaluacion_Controller::obtenerFases para usuario ID {$idUsuarioAutenticado}, Nivel ID {$idNivelDelEvaluador}: ".$e->getMessage());
            return response()->json(['message' => 'Error interno al cargar las fases.'], 500);
        }
    }


    /**
     * Obtener la lista de olimpistas para una fase específica.
     */
    public function obtenerOlimpistasPorFase(Request $request, $id_fase)
    {
        // --- INICIO DE CORRECCIÓN ---
        $evaluadorData = $this->getEvaluadorData();
        if (!$evaluadorData) {
            return response()->json([
                'message' => 'No se pudo determinar el área o nivel del evaluador.'
            ], 403);
        }

        $idAreaEvaluador = $evaluadorData['id_area'];
        $idNivelEvaluador = $evaluadorData['id_nivel'];
        $idUsuarioAutenticado = $evaluadorData['id_usuario'];
        // --- FIN DE CORRECCIÓN ---

        // Buscar el id_nivel_fase correspondiente
        $nivelFase = Nivel_Fase::where('id_nivel', $idNivelEvaluador)
                               ->where('id_fase', $id_fase)
                               ->first();

        if (!$nivelFase) {
            Log::warning("Evaluacion_Controller::obtenerOlimpistas - No se encontró Nivel_Fase para Nivel ID: {$idNivelEvaluador} y Fase ID: {$id_fase}");
            return response()->json(['message' => 'Combinación de nivel y fase no válida.'], 404);
        }
        $idNivelFase = $nivelFase->id_nivel_fase;

        try {
            // 1. Obtener los olimpistas
            $olimpistas = Olimpista::where('id_area', $idAreaEvaluador)
                                   ->where('id_nivel', $idNivelEvaluador)
                                   ->get();

            // 2. Obtener las evaluaciones existentes
            $evaluacionesExistentes = Evaluacion::where('id_nivel_fase', $idNivelFase)
                ->whereIn('id_olimpista', $olimpistas->pluck('id_olimpista'))
                ->with('estado_olimpista')
                ->get()
                ->keyBy('id_olimpista');

            // 3. Mapear los resultados
            $resultadoOlimpistas = $olimpistas->map(function ($olimpista) use ($evaluacionesExistentes) {
                $evaluacion = $evaluacionesExistentes->get($olimpista->id_olimpista);
                return [
                    'id' => $olimpista->id_olimpista,
                    'nombre' => $olimpista->nombre . ' ' . $olimpista->apellidos,
                    'ci' => $olimpista->ci,
                    'institucion' => $olimpista->institucion,
                    'nota' => $evaluacion ? (float) $evaluacion->nota : null,
                    'falta_etica' => $evaluacion ? (bool) $evaluacion->falta_etica : false,
                    'observaciones' => $evaluacion ? $evaluacion->comentario : '',
                    'estado' => $evaluacion?->estado_olimpista?->nombre ?? '-',
                ];
            });

            return response()->json($resultadoOlimpistas);

        } catch (\Throwable $e) {
             Log::error("Error en Evaluacion_Controller::obtenerOlimpistas para Usuario ID {$idUsuarioAutenticado}, NivelFase ID {$idNivelFase}: ".$e->getMessage());
             Log::error("Stack trace: ".$e->getTraceAsString());
            return response()->json(['message' => 'Error interno al cargar los olimpistas.'], 500);
        }
    }


     /**
     * Guardar/Actualizar las notas.
     */
    public function guardarNotas(Request $request, $id_fase)
    {
        // --- INICIO DE CORRECCIÓN ---
        $evaluadorData = $this->getEvaluadorData();
        if (!$evaluadorData) {
            return response()->json([
                'message' => 'No se pudo determinar el área o nivel del evaluador.'
            ], 403);
        }
        $idNivelEvaluador = $evaluadorData['id_nivel'];
        $idUsuarioAutenticado = $evaluadorData['id_usuario'];
        $idEvaluador = $evaluadorData['id_evaluador'];
        // --- FIN DE CORRECCIÓN ---

        // Buscar el id_nivel_fase
        $nivelFase = Nivel_Fase::where('id_nivel', $idNivelEvaluador)
                               ->where('id_fase', $id_fase)
                               ->first();

        if (!$nivelFase) {
             Log::warning("Evaluacion_Controller::guardarNotas - No se encontró Nivel_Fase para Nivel ID: {$idNivelEvaluador} y Fase ID: {$id_fase}");
            return response()->json(['message' => 'Combinación de nivel y fase no válida.'], 404);
        }
        $idNivelFase = $nivelFase->id_nivel_fase;

        // Validar los datos recibidos
        $validated = $request->validate([
            'olimpistas' => 'required|array',
            'olimpistas.*.id' => 'required|integer|exists:olimpista,id_olimpista',
            'olimpistas.*.nota' => 'nullable|numeric|min:0|max:100',
            'olimpistas.*.falta_etica' => 'required|boolean',
            'olimpistas.*.observaciones' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['olimpistas'] as $olimpistaData) {
                Evaluacion::updateOrCreate(
                    [
                        'id_olimpista' => $olimpistaData['id'],
                        'id_nivel_fase' => $idNivelFase,
                    ],
                    [
                        'nota' => $olimpistaData['nota'] ?? null,
                        'falta_etica' => $olimpistaData['falta_etica'],
                        'comentario' => $olimpistaData['observaciones'] ?? '',
                        // --- INICIO DE CORRECCIÓN ---
                        // Añadimos id_evaluador si tu tabla 'evaluacion' lo tiene (descomenta si es así)
                        // 'id_evaluador' => $idEvaluador, 
                        // --- FIN DE CORRECCIÓN ---
                    ]
                );
            }
            DB::commit();
            return response()->json(['message' => 'Notas guardadas correctamente']);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Error en Evaluacion_Controller::guardarNotas para Usuario ID {$idUsuarioAutenticado}, NivelFase ID {$idNivelFase}: ".$e->getMessage());
            Log::error("Stack trace: ".$e->getTraceAsString());
            Log::error("Request data: ", $request->input('olimpistas'));
            return response()->json(['message' => 'Error interno al guardar las notas.'], 500);
        }
    }

    /**
     * Generar clasificados para una fase.
     */
    public function generarClasificados(Request $request, $id_fase)
    {
         // --- INICIO DE CORRECCIÓN ---
        $evaluadorData = $this->getEvaluadorData();
        if (!$evaluadorData) {
            return response()->json(['message' => 'No se pudo determinar el nivel del evaluador.'], 403);
        }
        $idNivelEvaluador = $evaluadorData['id_nivel'];
        $idUsuarioAutenticado = $evaluadorData['id_usuario'];
        // --- FIN DE CORRECCIÓN ---

        $nivelFase = Nivel_Fase::where('id_nivel', $idNivelEvaluador)
                               ->where('id_fase', $id_fase)
                               ->first();
        if (!$nivelFase) {
             Log::warning("Evaluacion_Controller::generarClasificados - No se encontró Nivel_Fase para Nivel ID: {$idNivelEvaluador} y Fase ID: {$id_fase}");
            return response()->json(['message' => 'Combinación de nivel y fase no válida.'], 404);
        }
        $idNivelFase = $nivelFase->id_nivel_fase;

        // EJEMPLO FIJO (¡CAMBIAR POR LÓGICA REAL!):
        $notaMinima = 51; // ¡¡¡ IMPORTANTE: DEFINE ESTO CORRECTAMENTE !!!

        $idEstadoAprobado = Estado_Olimpista::where('nombre', 'Aprobado')->value('id_estado_olimpista');
        $idEstadoReprobado = Estado_Olimpista::where('nombre', 'Reprobado')->value('id_estado_olimpista');

        if (!$idEstadoAprobado || !$idEstadoReprobado) {
             Log::error("Evaluacion_Controller::generarClasificados - No se encontraron los estados 'Aprobado' o 'Reprobado'.");
            return response()->json(['message' => 'Error de configuración: Faltan estados Aprobado/Reprobado.'], 500);
        }

        DB::beginTransaction();
        try {
            Evaluacion::where('id_nivel_fase', $idNivelFase)
                ->chunkById(100, function ($evaluaciones) use ($notaMinima, $idEstadoAprobado, $idEstadoReprobado) {
                    foreach ($evaluaciones as $evaluacion) {
                        if ($evaluacion->nota !== null && $evaluacion->nota >= $notaMinima && !$evaluacion->falta_etica) {
                            $evaluacion->id_estado_olimpista = $idEstadoAprobado;
                        } else {
                            $evaluacion->id_estado_olimpista = $idEstadoReprobado;
                        }
                        $evaluacion->save();
                    }
                });
            DB::commit();
             Log::info("Clasificados generados para NivelFase ID {$idNivelFase} por Usuario ID {$idUsuarioAutenticado}. Nota mínima: {$notaMinima}");
            return response()->json(['message' => 'Clasificados generados correctamente']);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Error en Evaluacion_Controller::generarClasificados para NivelFase ID {$idNivelFase}: ".$e->getMessage());
             Log::error("Stack trace: ".$e->getTraceAsString());
            return response()->json(['message' => 'Error interno al generar clasificados.'], 500);
        }
    }


    /**
     * Marcar la lista de una fase como "enviada".
     */
    public function enviarLista(Request $request, $id_fase)
    {
         // --- INICIO DE CORRECCIÓN ---
        $evaluadorData = $this->getEvaluadorData();
        if (!$evaluadorData) {
            return response()->json(['message' => 'No se pudo determinar el nivel del evaluador.'], 403);
        }
        $idNivelEvaluador = $evaluadorData['id_nivel'];
        $idUsuarioAutenticado = $evaluadorData['id_usuario'];
        // --- FIN DE CORRECCIÓN ---

        $nivelFase = Nivel_Fase::where('id_nivel', $idNivelEvaluador)
                               ->where('id_fase', $id_fase)
                               ->first();

        if (!$nivelFase) {
            return response()->json(['message' => 'Combinación de nivel y fase no válida.'], 404);
        }
        $idNivelFase = $nivelFase->id_nivel_fase;

        $idEstadoFinalizada = Estado_Fase::where('nombre', 'Finalizada')->value('id_estado_fase'); 
        
        if (!$idEstadoFinalizada) {
             Log::error("Evaluacion_Controller::enviarLista - No se encontró el estado 'Finalizada'.");
            return response()->json(['message' => 'Error de configuración: Falta estado Finalizada.'], 500);
        }

        DB::beginTransaction();
        try {
            $nivelFase->id_estado_fase = $idEstadoFinalizada;
            $nivelFase->save();
            DB::commit();
             Log::info("Lista enviada para NivelFase ID {$idNivelFase} por Usuario ID {$idUsuarioAutenticado}.");
            return response()->json(['message' => 'Lista marcada como enviada correctamente']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Error en Evaluacion_Controller::enviarLista para NivelFase ID {$idNivelFase}: ".$e->getMessage());
             Log::error("Stack trace: ".$e->getTraceAsString());
            return response()->json(['message' => 'Error interno al marcar la lista como enviada.'], 500);
        }
    }

} // Fin de la clase
