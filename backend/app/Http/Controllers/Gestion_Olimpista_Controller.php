<?php

namespace App\Http\Controllers;

use App\Models\Olimpista; // <-- CORREGIDO: Usa el modelo correcto 'Olimpista'
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // <-- AÑADIDO: Para validaciones más complejas

class Gestion_Olimpista_Controller extends Controller
{
    /**
     * Recuperar todos los olimpistas con su departamento.
     */
    public function index()
    {
        // Carga todos los olimpistas junto con la información de su departamento.
        $olimpistas = Olimpista::with('departamento')->get();
        return response()->json($olimpistas);
    }

    /**
     * Muestra un único olimpista.
     * Laravel encontrará automáticamente al olimpista usando el 'ci' de la URL.
     */
    public function show(Olimpista $olimpista)
    {
        // Carga la relación con el departamento y devuelve el olimpista.
        return $olimpista->load('departamento');
    }

    /**
     * Actualiza un olimpista existente.
     * Laravel también usa el 'ci' de la URL para encontrar al olimpista a actualizar.
     */
    public function update(Request $request, Olimpista $olimpista)
    {
        // Valida los datos de entrada.
        $validatedData = $request->validate([
            // La regla 'unique' ahora ignora el CI del olimpista actual al validar.
            'ci' => ['sometimes', 'string', 'max:15', Rule::unique('olimpistas')->ignore($olimpista)],
            'nombre' => ['sometimes', 'string', 'max:100'],
            'institucion' => ['nullable', 'string', 'max:150'],
            'area' => ['nullable', 'string', 'max:50'],
            'nivel' => ['nullable', 'string', 'max:50'],
            'grado' => ['nullable', 'string', 'max:50'],
            'contacto_tutor' => ['nullable', 'string', 'max:150'],
            'id_departamento' => ['sometimes', 'integer', 'exists:departamento,id_departamento'],
        ]);

        // Actualiza el olimpista con los datos validados.
        $olimpista->update($validatedData);

        return response()->json([
            'message' => 'Olimpista actualizado correctamente',
            'data' => $olimpista->load('departamento') // Devuelve el modelo actualizado con su departamento
        ]);
    }

    /**
     * Elimina un olimpista.
     * Laravel usa el 'ci' de la URL para encontrarlo.
     */
    public function destroy(Olimpista $olimpista)
    {
        $olimpista->delete();

        // Devuelve una respuesta 204 No Content, que es el estándar para eliminaciones exitosas.
        return response()->json(null, 204);
    }
}