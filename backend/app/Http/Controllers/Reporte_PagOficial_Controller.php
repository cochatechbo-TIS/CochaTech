<?php

namespace App\Http\Controllers;

use App\Models\Premiacion_Olimpista;
use Illuminate\Http\Request;

class Reporte_PagOficial_Controller extends Controller
{
    public function obtenerPremiados($id_area, $id_nivel)
    {
        // Leer premiados según área y nivel
        $premiados = Premiacion_Olimpista::with([
                'olimpista:id_olimpista,nombre,apellidos,id_area',
                'olimpista.area:id_area,nombre'
            ])
            ->where('id_nivel', $id_nivel)
            ->whereHas('olimpista', function ($query) use ($id_area) {
                $query->where('id_area', $id_area);
            })
            ->orderBy('posicion')
            ->get()
            ->map(function ($item) {
                return [
                    'nombre'   => $item->olimpista->nombre ?? null,
                    'apellido' => $item->olimpista->apellidos ?? null,
                    'area'     => $item->olimpista->area->nombre ?? null,
                    'posicion' => $item->posicion,
                ];
            });

        if ($premiados->isEmpty()) {
            return response()->json([
                'error' => 'No existen premiados para esta combinación de área y nivel.'
            ], 404);
        }

        return response()->json([
            'area'      => $id_area,
            'nivel'     => $id_nivel,
            'premiados' => $premiados
        ]);
    }
}
