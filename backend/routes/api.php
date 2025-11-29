<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Gestion_Olimpista_Controller;
use App\Http\Controllers\Importar_Olimpista_Controller;
use App\Http\Controllers\Responsable_Area_Controller;
use App\Http\Controllers\Evaluador_Controller;
use App\Http\Controllers\Generar_Lista_Controller;
use App\Http\Controllers\Area_Controller;
use App\Http\Controllers\Primera_Fase_Controller;
use App\Http\Controllers\Clasificacion_Controller;
use App\Http\Controllers\Fase_Dinamico_Controller;
use App\Http\Controllers\Fase_Lista_Controller;
use App\Http\Controllers\Fase_Consulta_Controller;
//use App\Http\Controllers\EvaluacionController;

use App\Http\Controllers\Nivel_Fase_Controller;
use App\Http\Controllers\Nivel_Evaluador;
use App\Http\Controllers\Medallero_Configuracion_Controller;
use App\Http\Controllers\Premiacion_Controller;

use App\Http\Controllers\Reporte_Premiacion_Controller;
use App\Http\Controllers\Reporte_PagOficial_Controller;
use App\Http\Controllers\Reporte_Ceremonia_Controller;

use App\Http\Controllers\Evaluador_Nivel_Controller ;

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

        Route::get('/medallero-config', [Medallero_Configuracion_Controller::class, 'index']);
        Route::post('/medallero-config', [Medallero_Configuracion_Controller::class, 'store']);
    });
    // Grupo Responsable 
    Route::middleware('role:responsable')->group(function () {
        Route::get('/niveles/auth', [Generar_Lista_Controller::class, 'listarPorAuth']);
        Route::post('/nivel-fase/rechazar/{id_nivel_fase}', [Nivel_Fase_Controller::class, 'rechazar']);
        Route::post('/nivel-fase/aprobar/{id_nivel_fase}', [Nivel_Fase_Controller::class, 'aprobar']);
        Route::get('/evaluadores-por-area/{id_area}', [Nivel_Evaluador::class, 'evaluadoresPorArea']);
        Route::post('/niveles/asignar-evaluador', [Nivel_Evaluador::class, 'asignarEvaluador']);

        Route::get('/premiacion/asignar/{id_nivel}', [Premiacion_Controller::class, 'asignarPremios']);
        
    });    

    Route::middleware('role:evaluador')->group(function () {

        // Endpoint CERO: Obtener la info del evaluador y sus fases
        //Route::get('/evaluador/inicio/{idNivel?}', [Evaluador_Controller::class, 'obtenerDatosIniciales']);//si
        Route::get('/evaluador/datos-iniciales/{idNivel?}', [Evaluador_Controller::class, 'obtenerDatosIniciales']);

        Route::get('/evaluador/niveles', [Evaluador_Nivel_Controller ::class, 'obtenerNivelesEvaluador']);
    });

    Route::get('/nivel-fase/{id_nivel_fase}', [Nivel_Fase_Controller::class, 'mostrar']);//ver el estado y el comentario de la fase (no se si deberia ir a responsable y evaluador ... )//si

    Route::get('/primera/fase/{idNivel}', [Primera_Fase_Controller::class, 'generarYObtenerPrimeraFase']);//si

    Route::post('/clasificacion/{id_nivel_fase}', [Clasificacion_Controller::class, 'registrarEvaluaciones']);//si
    Route::post('/fase-nivel/siguiente/{idNivel}', [Fase_Dinamico_Controller::class, 'crearSiguienteFase']);//si
    Route::get('/cantidad/fases/{idNivel}', [Fase_Lista_Controller::class, 'listarFasesPorNivel']);//2 si
    Route::get('/fase/{idNivelFase}', [Fase_Consulta_Controller::class, 'mostrarFase']);//3 si

    //informes -reportes
    Route::get('/reporte-premiacion/{id_area}/{id_nivel}', [Reporte_Premiacion_Controller::class, 'generarReporte']);
    Route::get('/reporte-oficial/{id_area}/{id_nivel}', [Reporte_PagOficial_Controller::class, 'obtenerPremiados']);
    Route::get('/reporte-ceremonia/{id_area}/{id_nivel}', [Reporte_Ceremonia_Controller::class, 'obtenerPremiados']);
}); 
