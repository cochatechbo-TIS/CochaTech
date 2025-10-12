<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\Gestion_Olimpista_Controller;
use App\Http\Controllers\Importar_Olimpista_Controller;
use App\Http\Controllers\Responsable_Area_Controller;
use App\Http\Controllers\Evaluador_Controller;
use App\Http\Controllers\AreaNivelController;


    // --- RUTAS DE GESTIÓN GENERAL (PARA USUARIOS AUTENTICADOS) ---
    Route::get('/olimpistas', [Gestion_Olimpista_Controller::class, 'index']);
    Route::put('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'update']);
    Route::delete('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'destroy']);
    Route::post('/olimpistas/importar', [Importar_Olimpista_Controller::class, 'importar']);
    Route::get('/usuario', [UsuarioController::class, 'index']);     
    Route::post('/usuario', [UsuarioController::class, 'store']);     
    Route::put('/usuario/{id}', [UsuarioController::class, 'update']); 
    Route::delete('/usuario/{id}', [UsuarioController::class, 'destroy']);
    Route::get('/responsable', [Responsable_Area_Controller::class, 'index']);     
    Route::post('/responsable', [Responsable_Area_Controller::class, 'store']);     
    Route::put('/responsable/{id}', [Responsable_Area_Controller::class, 'update']); 
    Route::delete('/responsable/{id}', [Responsable_Area_Controller::class, 'destroy']);
    
    Route::get('/evaluador', [Evaluador_Controller::class, 'index']);     
    Route::post('/evaluador', [Evaluador_Controller::class, 'store']);     
    Route::put('/evaluador/{id}', [Evaluador_Controller::class, 'update']); 
    Route::delete('/evaluador/{id}', [Evaluador_Controller::class, 'destroy']);


    Route::post('/area-nivel', [AreaNivelController::class, 'generarYListar']);
