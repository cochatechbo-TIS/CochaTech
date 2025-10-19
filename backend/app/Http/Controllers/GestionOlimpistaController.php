<?php

namespace App\Http\Controllers;

// CORRECCIÓN: Cambiado de Gestion_Olimpista a Olimpista
use App\Models\Olimpista;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class GestionOlimpistaController extends Controller
{
    // Recuperar todos los olimpistas con relaciones
    public function index()
    {
        // CORRECCIÓN: Cambiado de Gestion_Olimpista a Olimpista
        $olimpistas = Olimpista::with(['departamento', 'area', 'nivel'])->get();

        // Transformar cada olimpista para enviar solo los nombres de nivel y departamento
        $olimpistasTransformados = $olimpistas->map(function($olimpista) {
            return [
                'id_olimpista' => $olimpista->id_olimpista,
                'ci' => $olimpista->ci,
                'nombre' => $olimpista->nombre,
                'apellidos' => $olimpista->apellidos,
                'institucion' => $olimpista->institucion,
                'area' => $olimpista->area->nombre ?? null,      // solo nombre del area
                'nivel' => $olimpista->nivel->nombre ?? null,      // solo nombre del nivel
                'grado' => $olimpista->grado,
                'contacto_tutor' => $olimpista->contacto_tutor,
                'nombre_tutor' => $olimpista->nombre_tutor,
                'id_departamento' => $olimpista->id_departamento,
                'departamento' => $olimpista->departamento->nombre_departamento ?? null // solo nombre
            ];
        });

        return response()->json([
            'message' => 'Lista de olimpistas recuperada correctamente',
            'data' => $olimpistasTransformados
        ]);
    }


    // Actualizar un olimpista
    public function update(Request $request, $id)
    {
        try {
            // CORRECCIÓN: Cambiado de Gestion_Olimpista a Olimpista
            $olimpista = Olimpista::find($id);

            if (!$olimpista) {
                return response()->json(['message' => 'Olimpista no encontrado'], 404);
            }

            $data = $request->only([
                'ci', 'nombre', 'apellidos', 'institucion', 
                'id_area', 'id_nivel', 'grado', 
                'contacto_tutor', 'nombre_tutor', 'id_departamento'
            ]);

            $validator = Validator::make($data, [
                'nombre' => 'nullable|string|max:100',
                'apellidos' => 'nullable|string|max:100',
                'ci' => 'nullable|string|max:15|unique:olimpista,ci,'.$id.',id_olimpista',
                'institucion' => 'nullable|string|max:150',
                'id_area' => 'nullable|integer|exists:area,id_area',
                'id_nivel' => 'nullable|integer|exists:nivel,id_nivel',
                'grado' => 'nullable|string|max:50',
                'contacto_tutor' => 'nullable|string|max:150',
                'nombre_tutor' => 'nullable|string|max:150',
                'id_departamento' => 'nullable|integer|exists:departamento,id_departamento',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $olimpista->fill($data);
            $olimpista->save();

            return response()->json([
                'message' => 'Olimpista actualizado correctamente',
                'data' => $olimpista
            ]);
        } catch (\Throwable $e) {
            Log::error('Error actualizando olimpista: '.$e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Error actualizando olimpista',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar un olimpista
    public function destroy($id)
    {
        // CORRECCIÓN: Cambiado de Gestion_Olimpista a Olimpista
        $olimpista = Olimpista::find($id);

        if (!$olimpista) {
            return response()->json(['message' => 'Olimpista no encontrado'], 404);
        }

        $olimpista->delete();

        return response()->json([
            'message' => 'Olimpista eliminado correctamente'
        ]);
    }
}
