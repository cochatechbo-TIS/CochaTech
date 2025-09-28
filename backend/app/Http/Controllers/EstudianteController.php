<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;

class EstudianteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
        ]);

        $estudiante = Estudiante::create($validated);

        return response()->json([
            'message' => 'Estudiante creado correctamente',
            'data' => $estudiante
        ], 201);
    }
}
