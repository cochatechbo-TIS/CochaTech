<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteController;

Route::post('/estudiantes', [EstudianteController::class, 'store']);
