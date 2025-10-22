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
        $credentials = $request->only('email', 'password');
        // 2. Buscar al usuario por su email
        $user = Usuario::where('email', $request->email)->first();
        // 3. Verificar si el usuario existe y la contraseña es correcta
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }
         ///esde aqui estoy trayendo el codigo que hiciste a en las rutas
        if (Auth::attempt($credentials)) {
            /** @var \App\Models\User $user */
            
            $user = Auth::user();

            // Elimina tokens antiguos para mantener una sola sesión activa
            $user->tokens()->delete();

            // Crea el nuevo token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Carga la información del rol del usuario para devolverla en la respuesta
            $userWithRole = $user->load('rol');

            // Devuelve el token y los datos del usuario, incluyendo su rol
            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $userWithRole->id_usuario,
                    'nombre' => $userWithRole->nombre,
                    'apellidos' => $userWithRole->apellidos,
                    'email' => $userWithRole->email,
                    'rol' => $userWithRole->rol,
                ]
            ]);
        }
        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    // Obtener usuario autenticado
    public function user(Request $request)
    {
        return $request->user()->load('rol');
    }
}