<?php

namespace App\Http\Controllers;

use App\Models\Premiacion_Olimpista;
use App\Models\Nivel;
use Illuminate\Http\Request;

class Reporte_PagOficial_Controller extends Controller
{
    public function obtenerPremiados($id_area, $id_nivel)
    {
        // Obtener el nivel y saber si es grupal
        $nivel = Nivel::findOrFail($id_nivel);
        $esGrupal = $nivel->es_grupal;

        // Consulta base
        $premiados = Premiacion_Olimpista::with([
            'olimpista.area',
            'olimpista.nivel',
            'equipo.area',
            'equipo.nivel',
            'equipo.olimpistas'
        ])
        ->where('id_nivel', $id_nivel)
        ->orderBy('posicion');

        // Filtrar según tipo
        if ($esGrupal) {
            $premiados->whereNotNull('id_equipo')
                      ->whereHas('equipo', function ($q) use ($id_area) {
                          $q->where('id_area', $id_area);
                      });
        } else {
            $premiados->whereNotNull('id_olimpista')
                      ->whereHas('olimpista', function ($q) use ($id_area) {
                          $q->where('id_area', $id_area);
                      });
        }

        $premiados = $premiados->get();

        if ($premiados->isEmpty()) {
            return response()->json([
                'error' => 'No existen premiados para esta combinación de área y nivel.'
            ], 404);
        }

        // Mapear resultados según tipo
        $resultado = $premiados->map(function ($item) use ($esGrupal) {

            if ($esGrupal) {
                $integrantes = $item->equipo->olimpistas->map(fn($o) => [
                    'nombre' => $o->nombre . ' ' . $o->apellidos,
                    'ci'     => $o->ci
                ]);

                return [
                    'nombre'       => $item->equipo->nombre_equipo,
                    'institucion'  => $item->equipo->institucion,
                    'area'         => $item->equipo->area->nombre ?? null,
                    'nivel'        => $item->equipo->nivel->nombre ?? null,
                    'posicion'     => $item->posicion,
                    'integrantes'  => $integrantes
                ];

            } else {
                return [
                    'nombre'       => $item->olimpista->nombre ?? null,
                    'apellido'     => $item->olimpista->apellidos ?? null,
                    'area'         => $item->olimpista->area->nombre ?? null,
                    'posicion'     => $item->posicion
                ];
            }
        });

        return response()->json([
            'area'      => $id_area,
            'nivel'     => $id_nivel,
            'tipo'      => $esGrupal ? 'grupal' : 'individual',
            'premiados' => $resultado
        ]);
    }
}
