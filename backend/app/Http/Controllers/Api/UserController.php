<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    /**
     * Almacena un nuevo usuario en la base de datos.
     * Esta función solo es accesible para administradores.
     */
    public function store(Request $request)
    {
        // 1. Valida los datos que llegan desde el frontend
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:usuario'],
            'password' => ['required', Rules\Password::defaults()],
            'id_rol' => ['required', 'integer', 'exists:rol,id_rol'], // Valida que el id_rol exista en la tabla 'rol'
        ]);

        // 2. Crea el nuevo usuario
        $user = User::create([
            'nombre' => $request->nombre,
            'apellidos' => $request->apellidos,
            'email' => $request->email,
            'password' => $request->password, // Laravel lo hashea automáticamente gracias a la configuración del modelo
            'id_rol' => $request->id_rol,
            'activo' => true,
            'telefono' => $request->telefono ?? 'N/A',
        ]);

        // 3. Devuelve una respuesta exitosa
        return response()->json([
            'message' => 'Usuario creado exitosamente.',
            'user' => $user,
        ], 201); // 201 = Creado
    }
}