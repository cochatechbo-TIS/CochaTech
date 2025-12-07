<?php

namespace App\Http\Controllers;

use App\Models\Nivel;
use App\Models\Premiacion_Olimpista;
use App\Models\Tipo_Premio;
use App\Models\Medallero_Configuracion;
use App\Models\Nivel_Fase;
use App\Models\Responsable_Area;
use Illuminate\Support\Facades\DB;

class Reporte_Premiacion_Controller extends Controller
{
    public function generarReporte($id_area, $id_nivel)
    {
        // 1. Validar responsable del área
        $responsable = Responsable_Area::with('usuario')
            ->where('id_area', $id_area)
            ->first();

        if (!$responsable) {
            return response()->json(['error' => 'Área inválida o sin responsable.'], 404);
        }

        // 2. Obtener nivel
        $nivel = Nivel::with('area')->findOrFail($id_nivel);

        // 3. Recuperar premiaciones YA REGISTRADAS
        $premiadosDB = Premiacion_Olimpista::with([
                'olimpista.departamento',
                'olimpista.area',
                'olimpista.nivel',
                'olimpista.tutor',
                'equipo.olimpistas',
                'equipo',
                'tipoPremio'
            ])
            ->where('id_nivel', $id_nivel)
            ->orderBy('posicion')
            ->get();

        if ($premiadosDB->isEmpty()) {
            return response()->json(['error' => 'No hay premiación registrada para este nivel.'], 404);
        }

        $premiados = [];

        foreach ($premiadosDB as $p) {

            // Si es individual
            if ($p->id_olimpista !== null) {
                $o = $p->olimpista;

                $premiados[] = [
                    'nombre'           => $o->nombre . ' ' . $o->apellidos,
                    'ci'               => $o->ci,
                    'institucion'      => $o->institucion,
                    'departamento'     => $o->departamento->nombre_departamento ?? null,
                    'area'             => $o->area->nombre ?? null,
                    'nivel'            => $o->nivel->nombre ?? null,
                    'tutor'            => $o->tutor['nombre'] ?? null,
                    'nota'             => null, // ya no calculamos nota
                    'medalla'          => $p->tipoPremio->nombre ?? null,
                    'posicion'         => $p->posicion,
                    'responsable_area' => $responsable->usuario->nombre . ' ' . $responsable->usuario->apellidos,
                ];

            } else {
                // Si es grupal
                $equipo = $p->equipo;
                $primerOlimpista = $equipo->olimpistas->first();
                $tutorEquipo = $primerOlimpista?->tutor['nombre'] ?? null;

                $premiados[] = [
                    'nombre'           => $equipo->nombre_equipo,
                    'institucion'      => $equipo->institucion,
                    'departamento'     => $primerOlimpista?->departamento?->nombre_departamento,
                    'area'             => $nivel->area->nombre,
                    'nivel'            => $nivel->nombre,
                    'tutor'            => $tutorEquipo,
                    'nota'             => null,
                    'medalla'          => $p->tipoPremio->nombre ?? null,
                    'posicion'         => $p->posicion,
                    'responsable_area' => $responsable->usuario->nombre . ' ' . $responsable->usuario->apellidos,
                    'integrantes'      => $equipo->olimpistas->map(fn($m) => [
                        'nombre' => $m->nombre . ' ' . $m->apellidos,
                        'ci'     => $m->ci
                    ])
                ];
            }
        }

        return response()->json([
            'success'   => 'Premiación recuperada correctamente.',
            'nivel'     => $nivel->nombre,
            'premiados' => $premiados
        ], 200);
    }
}
