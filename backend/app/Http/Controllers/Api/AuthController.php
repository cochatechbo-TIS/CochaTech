<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Maneja la solicitud de login del usuario.
     */
    public function login(Request $request)
    {
        // 1. Validar los datos de entrada
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Buscar al usuario por su email
        $user = Usuario::where('email', $request->email)->first();

        // 3. Verificar si el usuario existe y la contraseña es correcta
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // 4. Eliminar tokens antiguos (solo una sesión activa)
        $user->tokens()->delete();

        // 5. Crear un nuevo token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 6. Cargar relación 'rol' para devolver al frontend
        $userWithRole = $user->load('rol');

        // 7. Devolver respuesta
        return response()->json([
            'message' => '¡Login exitoso!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $userWithRole->id_usuario,
                'nombre' => $userWithRole->nombre,
                'apellidos' => $userWithRole->apellidos,
                'email' => $userWithRole->email,
                'rol' => $userWithRole->rol,
            ],
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    /**
     * Obtener usuario autenticado
     */
    public function user(Request $request)
    {
        return $request->user()->load('rol');
    }
}
