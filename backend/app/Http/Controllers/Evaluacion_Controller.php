<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// --- AÑADIMOS LOS MODELOS QUE USAREMOS ---
use App\Models\Evaluador;
use App\Models\Nivel_Fase;
use App\Models\Olimpista;
use App\Models\Evaluacion;
use App\Models\Estado_Olimpista;

class Evaluacion_Controller extends Controller
{

    /**
     * Endpoint 1: Obtener las fases para las pestañas
     * GET /api/evaluador/fases
     *
     * Obtiene las fases (Clasificatoria, Semifinal, etc.) asignadas
     * al nivel del evaluador autenticado.
     */
    public function obtenerFases()
    {
        try {
            $user = Auth::user();
            $evaluador = $user->evaluador; // Asumimos que la relación 'evaluador' existe en el modelo Usuario

            if (!$evaluador || !$evaluador->id_nivel) {
                return response()->json(['message' => 'El usuario no es un evaluador válido o no tiene un nivel asignado.'], 403);
            }

            // Buscamos las fases que corresponden al nivel del evaluador
            $fases = Nivel_Fase::where('id_nivel', $evaluador->id_nivel)
                ->with(['fase', 'estadoFase']) // Cargamos las relaciones
                ->get()
                ->map(function ($nivelFase) {
                    // Formateamos la respuesta para que coincida con la interfaz de Evaluacion.ts
                    return [
                        'id' => $nivelFase->fase->id_fase, // ID de la fase
                        'nombre' => $nivelFase->fase->nombre_fase, // Nombre de la fase
                        'estado' => $nivelFase->estadoFase->nombre_estado, // Ej: "En proceso"
                        'id_nivel_fase' => $nivelFase->id_nivel_fase, // ID pivote que usaremos
                    ];
                });

            return response()->json($fases);

        } catch (\Exception $e) {
            Log::error('Error al obtener fases: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno del servidor'], 500);
        }
    }

    /**
     * Endpoint 2: Obtener la lista de olimpistas para la tabla
     * GET /api/evaluacion/fase/{id_fase}
     *
     * Obtiene los olimpistas del área y nivel del evaluador
     * para una fase específica.
     */
    public function obtenerOlimpistasPorFase($id_fase)
    {
        try {
            $user = Auth::user();
            $evaluador = $user->evaluador;

            if (!$evaluador) {
                return response()->json(['message' => 'Usuario evaluador no encontrado.'], 403);
            }

            // 1. Encontrar el id_nivel_fase (la clave de todo)
            $nivelFase = $this->obtenerNivelFase($evaluador, $id_fase);
            if (!$nivelFase) {
                return response()->json(['message' => 'La fase no está configurada para tu nivel.'], 404);
            }

            // 2. Obtener los olimpistas del área y nivel del evaluador
            $olimpistas = Olimpista::where('id_area', $evaluador->id_area)
                ->where('id_nivel', $evaluador->id_nivel)
                // 3. Cruzar con la tabla 'evaluacion' para obtener notas existentes
                ->leftJoin('evaluacion', function ($join) use ($nivelFase) {
                    $join->on('olimpista.id_olimpista', '=', 'evaluacion.id_olimpista')
                         ->where('evaluacion.id_nivel_fase', '=', $nivelFase->id_nivel_fase);
                })
                // 4. Cruzar con 'estado_olimpista' para obtener el nombre del estado
                ->leftJoin('estado_olimpista', 'evaluacion.id_estado_olimpista', '=', 'estado_olimpista.id_estado_olimpista')
                // 5. Seleccionar los campos que el frontend necesita (según Evaluacion.ts)
                ->select(
                    'olimpista.id_olimpista as id',
                    DB::raw("CONCAT(olimpista.nombre, ' ', olimpista.apellidos) as nombre"),
                    'olimpista.ci',
                    'olimpista.institucion',
                    'evaluacion.nota',
                    'evaluacion.falta_etica',
                    'evaluacion.comentario as observaciones',
                    // Si no hay estado, devolvemos "-", como en la UI
                    DB::raw("COALESCE(estado_olimpista.nombre_estado, '-') as estado") 
                )
                ->get();

            return response()->json($olimpistas);

        } catch (\Exception $e) {
            Log::error('Error al obtener olimpistas por fase: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno del servidor: '.$e->getMessage()], 500);
        }
    }

    /**
     * Endpoint 3: Guardar las notas
     * POST /api/evaluacion/fase/{id_fase}/guardar
     *
     * Guarda la nota, falta_etica y observaciones para una lista de olimpistas.
     */
    public function guardarNotas(Request $request, $id_fase)
    {
        $user = Auth::user();
        $evaluador = $user->evaluador;

        // Validar que la data venga en el formato esperado
        $validated = $request->validate([
            'olimpistas' => 'required|array',
            'olimpistas.*.id' => 'required|integer|exists:olimpista,id_olimpista',
            'olimpistas.*.nota' => 'nullable|numeric|min:0|max:100',
            'olimpistas.*.falta_etica' => 'required|boolean',
            'olimpistas.*.observaciones' => 'nullable|string',
        ]);

        // Encontrar el id_nivel_fase
        $nivelFase = $this->obtenerNivelFase($evaluador, $id_fase);
        if (!$nivelFase) {
            return response()->json(['message' => 'La fase no está configurada para tu nivel.'], 404);
        }

        DB::beginTransaction();
        try {
            foreach ($validated['olimpistas'] as $olimpistaData) {
                // Usamos updateOrCreate para insertar o actualizar la evaluación
                Evaluacion::updateOrCreate(
                    [
                        // Criterios de búsqueda
                        'id_olimpista' => $olimpistaData['id'],
                        'id_nivel_fase' => $nivelFase->id_nivel_fase,
                    ],
                    [
                        // Valores a insertar/actualizar
                        'nota' => $olimpistaData['nota'] ?? null,
                        'falta_etica' => $olimpistaData['falta_etica'],
                        'comentario' => $olimpistaData['observaciones'] ?? null,
                        // Limpiamos el estado si la nota cambia (se recalculará)
                        'id_estado_olimpista' => null 
                    ]
                );
            }

            DB::commit();
            return response()->json(['message' => 'Notas guardadas correctamente.']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al guardar notas: ' . $e->getMessage());
            return response()->json(['message' => 'Error al guardar notas: '.$e->getMessage()], 500);
        }
    }

    /**
     * Endpoint 4: Generar Clasificados
     * POST /api/evaluacion/fase/{id_fase}/generar-clasificados
     *
     * Procesa las notas guardadas y asigna "Aprobado" o "Reprobado".
     */
    public function generarClasificados($id_fase)
    {
        $user = Auth::user();
        $evaluador = $user->evaluador;
        $nivelFase = $this->obtenerNivelFase($evaluador, $id_fase);
        if (!$nivelFase) {
            return response()->json(['message' => 'Fase no encontrada para tu nivel.'], 404);
        }

        // --- LÓGICA DE CLASIFICACIÓN (Ejemplo: aprobar con >= 51) ---
        // DEBES OBTENER ESTOS VALORES DE LA DB (ej. de la tabla 'fase')
        // Por ahora, los definimos aquí:
        $notaMinimaAprobacion = 51;
        $idEstadoAprobado = $this->obtenerIdEstado('Aprobado');
        $idEstadoReprobado = $this->obtenerIdEstado('Reprobado');
        
        if (!$idEstadoAprobado || !$idEstadoReprobado) {
             return response()->json(['message' => 'Estados "Aprobado" o "Reprobado" no encontrados. Ejecuta los seeders.'], 500);
        }
        
        DB::beginTransaction();
        try {
            // Actualizar APROBADOS
            Evaluacion::where('id_nivel_fase', $nivelFase->id_nivel_fase)
                ->where('nota', '>=', $notaMinimaAprobacion)
                ->where('falta_etica', false)
                ->update(['id_estado_olimpista' => $idEstadoAprobado]);

            // Actualizar REPROBADOS (por nota baja)
            Evaluacion::where('id_nivel_fase', $nivelFase->id_nivel_fase)
                ->where('nota', '<', $notaMinimaAprobacion)
                ->update(['id_estado_olimpista' => $idEstadoReprobado]);
                
            // Actualizar REPROBADOS (por falta ética, sin importar la nota)
            Evaluacion::where('id_nivel_fase', $nivelFase->id_nivel_fase)
                ->where('falta_etica', true)
                ->update(['id_estado_olimpista' => $idEstadoReprobado]);

            DB::commit();

            // Devolvemos la lista actualizada de olimpistas
            return $this->obtenerOlimpistasPorFase($id_fase);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al generar clasificados: ' . $e->getMessage());
            return response()->json(['message' => 'Error al generar clasificados.'], 500);
        }
    }

    /**
     * Endpoint 5: Enviar Lista (Finalizar Fase)
     * POST /api/evaluacion/fase/{id_fase}/enviar-lista
     *
     * Marca una fase como "Finalizada" (o "Pendiente de Aprobación").
     */
    public function enviarLista($id_fase)
    {
         $user = Auth::user();
         $evaluador = $user->evaluador;
         $nivelFase = $this->obtenerNivelFase($evaluador, $id_fase);
         if (!$nivelFase) {
             return response()->json(['message' => 'Fase no encontrada para tu nivel.'], 404);
         }
         
         // Lógica para cambiar el estado de la fase
         // DEBES OBTENER ESTE ID DE LA DB
         $idEstadoFinalizado = 3; // Asumiendo 1="En Proceso", 2="Pendiente", 3="Finalizado"
         
         try {
             $nivelFase->id_estado_fase = $idEstadoFinalizado;
             $nivelFase->save();
             
             return response()->json(['message' => 'Lista enviada y fase marcada como finalizada.']);
             
         } catch (\Exception $e) {
            Log::error('Error al enviar lista: ' . $e->getMessage());
            return response()->json(['message' => 'Error al enviar la lista.'], 500);
         }
    }


    // --- Métodos de Ayuda ---

    /**
     * Función privada para obtener el ID de nivel_fase
     */
    private function obtenerNivelFase(Evaluador $evaluador, $id_fase)
    {
        return Nivel_Fase::where('id_nivel', $evaluador->id_nivel)
            ->where('id_fase', $id_fase)
            ->first();
    }
    
    /**
     * Función privada para obtener el ID de un estado
     */
    private function obtenerIdEstado($nombreEstado)
    {
         $estado = Estado_Olimpista::where('nombre_estado', $nombreEstado)->first();
         return $estado ? $estado->id_estado_olimpista : null;
    }
}
