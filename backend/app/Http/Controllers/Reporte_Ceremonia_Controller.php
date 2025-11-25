<?php

namespace App\Http\Controllers;

use App\Models\Premiacion_Olimpista;
use Illuminate\Http\Request;

class Reporte_Ceremonia_Controller extends Controller
{
    public function obtenerPremiados($id_area, $id_nivel)
    {
        // Obtener premiados filtrando por área y nivel
        $premiados = Premiacion_Olimpista::with([
                'olimpista:id_olimpista,nombre,apellidos,institucion,id_area,id_nivel',
                'olimpista.area:id_area,nombre',
                'olimpista.nivel:id_nivel,nombre'
            ])
            ->where('id_nivel', $id_nivel)
            ->whereHas('olimpista', function ($query) use ($id_area) {
                $query->where('id_area', $id_area);
            })
            ->orderBy('posicion')
            ->get()
            ->map(function ($item) {
                return [
                    'nombre_completo' => $item->olimpista->nombre . ' ' . $item->olimpista->apellidos,
                    'institucion'     => $item->olimpista->institucion,
                    'area'            => $item->olimpista->area->nombre ?? null,
                    'nivel'           => $item->olimpista->nivel->nombre ?? null,
                    'posicion'        => $item->posicion,
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
