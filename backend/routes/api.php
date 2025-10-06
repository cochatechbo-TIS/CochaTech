<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\Gestion_Olimpista_Controller;
use App\Http\Controllers\ImportarOlimpistaController;
use App\Http\Controllers\Api\UserController; // <-- AÑADIDO: Importa el nuevo UserController

// ESTA ES LA RUTA DE LOGIN QUE NECESITAS
Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required', 'email'], // Recuerda que tu columna debe llamarse 'email'
        'password' => ['required'],
    ]);

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
                'full_name' => "{$userWithRole->nombre} {$userWithRole->apellidos}",
                'email' => $userWithRole->email,
                'rol' => $userWithRole->rol
            ]
        ]);
    }

    return response()->json(['message' => 'Credenciales incorrectas'], 401);
});

/* Rutas Protegidas (Requieren autenticación con Sanctum)*/
Route::middleware('auth:sanctum')->group(function () {

    // Ruta para obtener los datos del usuario autenticado (es útil para verificar el token)
    Route::get('/user', function (Request $request) {
        // Devuelve el usuario autenticado, cargando también su rol
        return $request->user()->load('rol');
    });
    
    // Ruta para cerrar sesión (logout)
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    });

    // --- RUTAS DE GESTIÓN GENERAL (PARA USUARIOS AUTENTICADOS) ---
    Route::get('/olimpistas', [Gestion_Olimpista_Controller::class, 'index']);
    Route::get('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'show']);
    Route::put('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'update']);
    Route::delete('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'destroy']);
    Route::post('/olimpistas/importar', [ImportarOlimpistaController::class, 'importar']);
    Route::get('/usuario', [UsuarioController::class, 'index']);     
    Route::post('/usuario', [UsuarioController::class, 'store']);     
    Route::put('/usuario/{id}', [UsuarioController::class, 'update']); 
    Route::delete('/usuario/{id}', [UsuarioController::class, 'destroy']);


    
    // --- RUTAS SOLO PARA ADMINISTRADORES ---
    // Este grupo anidado requiere, además de estar autenticado, tener el rol de admin
    Route::middleware('is_admin')->group(function () {
        // Ruta para crear un nuevo usuario
        // POST -> http://localhost:8000/api/admin/users
    Route::post('/admin/users', [UserController::class, 'store']);

        // Aquí podrías añadir más rutas de admin en el futuro, como:
        // Route::get('/admin/users', [UserController::class, 'index']); // Para listar todos los usuarios
    });

});