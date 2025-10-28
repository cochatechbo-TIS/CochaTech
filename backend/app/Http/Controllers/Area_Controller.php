<?php

namespace App\Http\Controllers;

use App\Models\Area;

class Area_Controller extends Controller
{
    public function listarNombres()
    {
        // Retorna solo los nombres como lista simple
        $nombres = Area::pluck('nombre');

        return response()->json($nombres);
    }
}
