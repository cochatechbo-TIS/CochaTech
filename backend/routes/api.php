<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Gestion_Olimpista_Controller;
use App\Http\Controllers\Importar_Olimpista_Controller;
use App\Http\Controllers\Responsable_Area_Controller;
use App\Http\Controllers\Evaluador_Controller;
use App\Http\Controllers\Generar_Lista_Controller;
use App\Http\Controllers\Area_Controller;
use App\Http\Controllers\Evaluacion_Controller; // <-- AÑADIR EL NUEVO CONTROLLER

Route::post('/login', [AuthController::class, 'login']);

// ¡NUEVAS RUTAS PARA RESETEO DE CONTRASEÑA!
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/areas/nombres', [Area_Controller::class, 'listarNombres']);
    // Grupo solo para ADMIN
    Route::middleware('role:administrador')->group(function () {
        // ... (tus rutas de admin: /olimpistas, /responsable, /evaluador, etc.)
        Route::get('/olimpistas', [Gestion_Olimpista_Controller::class, 'index']);
        Route::put('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'update']);
        Route::delete('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'destroy']);
        Route::post('/olimpistas/importar', [Importar_Olimpista_Controller::class, 'importar']);

        Route::get('/responsable', [Responsable_Area_Controller::class, 'index']);
        Route::post('/responsable', [Responsable_Area_Controller::class, 'store']);
        Route::put('/responsable/{id}', [Responsable_Area_Controller::class, 'update']);
        Route::delete('/responsable/{id}', [Responsable_Area_Controller::class, 'destroy']);

        Route::get('/evaluador', [Evaluador_Controller::class, 'index']);
        Route::post('/evaluador', [Evaluador_Controller::class, 'store']);
        Route::put('/evaluador/{id}', [Evaluador_Controller::class, 'update']);
        Route::delete('/evaluador/{id}', [Evaluador_Controller::class, 'destroy']);

        Route::get('/niveles/area/{nombre_area}', [Generar_Lista_Controller::class, 'listarPorArea']);
    });
    // Grupo Responsable 
    Route::middleware('role:responsable')->group(function () {
        Route::get('/niveles/auth', [Generar_Lista_Controller::class, 'listarPorAuth']);
    });

    // --- INICIO DE CÓDIGO AÑADIDO ---
    // Grupo Evaluador
    Route::middleware('role:evaluador')->group(function () {
        // Endpoint 1: Obtener fases para las pestañas
        // Nota: Cambiamos la ruta de `/fases/nivel/{id}` a `/evaluador/fases`
        // porque obtenemos el nivel del usuario autenticado, es más seguro.
        Route::get('/evaluador/fases', [Evaluacion_Controller::class, 'obtenerFases']);

        // Endpoint 2: Obtener lista de olimpistas
        Route::get('/evaluacion/fase/{id_fase}', [Evaluacion_Controller::class, 'obtenerOlimpistasPorFase']);
        
        // Endpoint 3: Guardar notas
        Route::post('/evaluacion/fase/{id_fase}/guardar', [Evaluacion_Controller::class, 'guardarNotas']);
        
        // Endpoint 4: Generar clasificados
        Route::post('/evaluacion/fase/{id_fase}/generar-clasificados', [Evaluacion_Controller::class, 'generarClasificados']);
        
        // Endpoint 5: Enviar lista
        Route::post('/evaluacion/fase/{id_fase}/enviar-lista', [Evaluacion_Controller::class, 'enviarLista']);
    });
    // --- FIN DE CÓDIGO AÑADIDO ---
});
