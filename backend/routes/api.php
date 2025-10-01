<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController; // Importa el nuevo controlador
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\Gestion_Olimpista_Controller;

/*
|--------------------------------------------------------------------------
| Rutas Públicas (No requieren autenticación)
|--------------------------------------------------------------------------
| Aquí pones el login, registro, o cualquier ruta que deba ser accesible
| para cualquier usuario o para tu frontend antes de iniciar sesión.
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/estudiantes', [EstudianteController::class, 'store']); // Ejemplo: registrar un estudiante puede ser público.


/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren autenticación con Sanctum)
|--------------------------------------------------------------------------
| Todas las rutas dentro de este grupo necesitarán enviar un token válido
| para poder acceder a ellas.
*/
Route::middleware('auth:sanctum')->group(function () {
    // Ruta para obtener los datos del usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Aquí deberías mover las rutas que quieres proteger
    Route::get('/olimpistas', [Gestion_Olimpista_Controller::class, 'index']);
    Route::get('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'show']);
    Route::put('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'update']);
    Route::delete('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'destroy']);

    // Puedes agregar más rutas protegidas aquí...
});
