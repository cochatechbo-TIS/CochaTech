<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\Gestion_Olimpista_Controller;

Route::post('/estudiantes', [EstudianteController::class, 'store']);
Route::get('/olimpistas', [Gestion_Olimpista_Controller::class, 'index']);
Route::get('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'show']);
Route::put('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'update']);
Route::delete('/olimpistas/{id}', [Gestion_Olimpista_Controller::class, 'destroy']);
