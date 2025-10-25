<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Usuario; 
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// --- ¡NUEVAS IMPORTACIONES! ---
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password as PasswordRules;

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

        // --- ¡INICIO DE NUEVA FUNCIONALIDAD! ---

    /**
     * Maneja la solicitud de "Olvidé mi contraseña".
     * Envía un enlace de reseteo al email del usuario.
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:usuario,email',
        ], [
            'email.exists' => 'No podemos encontrar un usuario con esa dirección de correo electrónico.'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // Envía el enlace de reseteo usando el sistema de Laravel
        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => '¡Correo de reseteo enviado! Revisa tu bandeja de entrada.'
            ], 200);
        }

        return response()->json([
            'message' => 'No se pudo enviar el correo. Inténtalo de nuevo más tarde.'
        ], 500);
    }

    /**
     * Maneja la solicitud de reseteo de contraseña.
     * Valida el token y actualiza la contraseña.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email|exists:usuario,email',
            'password' => [
                'required',
                'confirmed',
                PasswordRules::min(8)->mixedCase()->numbers() // Reglas de contraseña fuertes
            ],
        ], [
            'email.exists' => 'El email no coincide con el token.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error de validación', 'errors' => $validator->errors()], 422);
        }

        // Intenta resetear la contraseña
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // Esta función se ejecuta si el reseteo es exitoso
                $user->forceFill([
                    'password' => Hash::make($password),
                    'ultimo_acceso' => now() // Actualizamos su último acceso
                ])->save();
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['message' => '¡Contraseña actualizada! Ya puedes iniciar sesión.'], 200);
        }

        // Si el token es inválido o expiró
        return response()->json(['message' => 'El token de reseteo es inválido o ha expirado.'], 400);
    }
    // --- ¡FIN DE NUEVA FUNCIONALIDAD! ---
}
