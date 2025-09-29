<?php

namespace App\Http\Controllers;

use App\Models\Gestion_Olimpista;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class Gestion_Olimpista_Controller extends Controller
{
    // Recuperar todos los olimpistas con su departamento
    public function index()
    {
        $olimpistas = Gestion_Olimpista::with('departamento')->get();

        return response()->json([
            'message' => 'Lista de olimpistas recuperada correctamente',
            'data' => $olimpistas
        ]);
    }

        // Recuperar un olimpista por ID (no por CI)
        public function update(Request $request, $id)
    {
        try {
            $olimpista = Gestion_Olimpista::find($id);

            if (!$olimpista) {
                return response()->json(['message' => 'Olimpista no encontrado'], 404);
            }

            // Solo aceptar los campos previstos para evitar mass-assignment inseguro
            $data = $request->only([
                'ci', 'nombre', 'institucion', 'area',
                'nivel', 'grado', 'contacto_tutor', 'id_departamento'
            ]);

            // Validación básica (evita errores por FK inválida, unique, etc)
            $validator = \Validator::make($data, [
                'ci' => 'nullable|string|max:15|unique:olimpistas,ci,'.$id.',id_olimpista',
                'nombre' => 'nullable|string|max:100',
                'institucion' => 'nullable|string|max:150',
                'area' => 'nullable|string|max:50',
                'nivel' => 'nullable|string|max:50',
                'grado' => 'nullable|string|max:50',
                'contacto_tutor' => 'nullable|string|max:150',
                'id_departamento' => 'nullable|integer|exists:departamento,id_departamento',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
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
            // Guarda el error completo en el log y devuelve el mensaje al cliente (solo en dev)
            Log::error('Update error: '.$e->getMessage(), ['exception' => $e]);
            return response()->json([
                'message' => 'Error actualizando olimpista',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar un olimpista por ID
    public function destroy($id)
    {
        $olimpista = Gestion_Olimpista::find($id);

        if (!$olimpista) {
            return response()->json(['message' => 'Olimpista no encontrado'], 404);
        }

        $olimpista->delete();

        return response()->json([
            'message' => 'Olimpista eliminado correctamente'
        ]);
    }

}