<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Gestion_Olimpista_Controller;
use App\Http\Controllers\Importar_Olimpista_Controller;
use App\Http\Controllers\Responsable_Area_Controller;
use App\Http\Controllers\Evaluador_Controller;
use App\Http\Controllers\Area_Nivel_Controller;
use App\Models\Importar_Olimpista;
use App\Models\Area_Nivel;
use App\Models\Responsable_Area;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // Grupo solo para ADMIN
    Route::middleware('role:administrador')->group(function () {
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

    });

    // Grupo para ADMIN 
    Route::middleware('role:administrador')->group(function () {
       Route::get('/area/{nombre_area}/niveles', [Area_Nivel_Controller::class, 'listarPorArea']);
       
    });
    // Grupo Responsable 
    Route::middleware('role:responsable')->group(function () {
       Route::get('/area-nivel/auth', [Area_Nivel_Controller::class, 'listarPorAreaAuth']);
      
    });

});


