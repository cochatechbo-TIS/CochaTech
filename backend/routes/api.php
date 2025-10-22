<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Gestion_Olimpista_Controller;
use App\Http\Controllers\Importar_Olimpista_Controller;
use App\Http\Controllers\Responsable_Area_Controller;
use App\Http\Controllers\Evaluador_Controller;
use App\Http\Controllers\Area_Nivel_Controller;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

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
    Route::post('/area-nivel', [Area_Nivel_Controller::class, 'generarYListar']);

});
