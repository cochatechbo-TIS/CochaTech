<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
// CORRECCIÓN: Imports actualizados a PascalCase
use App\Http\Controllers\GestionOlimpistaController;
use App\Http\Controllers\ImportarOlimpistaController;
use App\Http\Controllers\ResponsableAreaController;
use App\Http\Controllers\EvaluadorController;
use App\Http\Controllers\AreaNivelController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Grupo solo para ADMIN
    Route::middleware('role:administrador')->group(function () {
        // CORRECCIÓN: Rutas actualizadas a PascalCase
        Route::get('/olimpistas', [GestionOlimpistaController::class, 'index']);
        Route::put('/olimpistas/{id}', [GestionOlimpistaController::class, 'update']);
        Route::delete('/olimpistas/{id}', [GestionOlimpistaController::class, 'destroy']);
        Route::post('/olimpistas/importar', [ImportarOlimpistaController::class, 'importar']);

        Route::get('/responsable', [ResponsableAreaController::class, 'index']);
        Route::post('/responsable', [ResponsableAreaController::class, 'store']);
        Route::put('/responsable/{id}', [ResponsableAreaController::class, 'update']);
        Route::delete('/responsable/{id}', [ResponsableAreaController::class, 'destroy']);

        Route::get('/evaluador', [EvaluadorController::class, 'index']);
        Route::post('/evaluador', [EvaluadorController::class, 'store']);
        Route::put('/evaluador/{id}', [EvaluadorController::class, 'update']);
        Route::delete('/evaluador/{id}', [EvaluadorController::class, 'destroy']);
    });

    // Grupo para ADMIN y RESPONSALE
    Route::middleware('role:administrador,responsable')->group(function () {
        
        Route::post('/area-nivel', [AreaNivelController::class, 'generarYListar']);
    });
});