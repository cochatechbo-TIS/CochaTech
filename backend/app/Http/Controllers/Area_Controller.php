<?php

namespace App\Http\Controllers;

use App\Models\Area;

class Area_Controller extends Controller
{
    public function listarNombres()
    {
        // Retorna solo los nombres como lista simple
        $nombres = Area::select('id_area', 'nombre')->get();//envia el id de area, necesario para /reporte-ceremonia

        return response()->json($nombres);
    }
}
