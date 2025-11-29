<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
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

        // 2. Obtener nivel y si es grupal
        $nivel = Nivel::with('area')->findOrFail($id_nivel);
        $esGrupal = $nivel->es_grupal;

        // 3. Obtener última fase del nivel
        $ultimaFase = Nivel_Fase::where('id_nivel', $id_nivel)
            ->orderByDesc('id_nivel_fase')
            ->first();

        if (!$ultimaFase) {
            return response()->json(['error' => 'No hay fases registradas para este nivel'], 400);
        }

        // 4. Obtener evaluaciones según tipo
        $evaluaciones = Evaluacion::with([
                'estadoOlimpista',
                'olimpista.departamento',
                'olimpista.area',
                'olimpista.nivel',
                'equipo',
                'equipo.olimpistas'
            ])
            ->where('id_nivel_fase', $ultimaFase->id_nivel_fase)
            ->when(!$esGrupal, fn($q) => $q->whereNotNull('id_olimpista'))
            ->when($esGrupal, fn($q) => $q->whereNotNull('id_equipo'))
            ->orderByDesc('nota')
            ->get();

        if ($evaluaciones->isEmpty()) {
            return response()->json(['error' => 'No hay evaluaciones.'], 400);
        }


        // NUEVO: Filtrar SOLO los clasificados
        $soloClasificados = $evaluaciones->filter(function ($eva) {
            return strtolower($eva->estadoOlimpista->nombre ?? '') === 'clasificado';
        })->values();

        if ($soloClasificados->isEmpty()) {
            return response()->json(['error' => 'No hay participantes clasificados.'], 400);
        }


        // 5. Configuración del medallero
        $config = Medallero_Configuracion::where('id_area', $id_area)
            ->get()
            ->keyBy('id_tipo_premio');

        if ($config->isEmpty()) {
            return response()->json(['error' => 'No existe configuración de medallas para esta área.'], 400);
        }

        // 6. Obtener tipo de premios
        $premios = Tipo_Premio::orderBy('orden')->get();

        DB::beginTransaction();

        try {

            // ELIMINAR PREMIACIÓN PREVIA
            Premiacion_Olimpista::where('id_nivel', $id_nivel)->delete();

            $premiados = [];
            $index = 0;

            //  NUEVO: Asignar medallas solo a clasificados
            foreach ($premios as $premio) {

                $cupos = $config[$premio->id_tipo_premio]->cantidad_por_nivel ?? 0;

                for ($i = 0; $i < $cupos; $i++) {

                    if (!isset($soloClasificados[$index])) break;

                    $evaluado = $soloClasificados[$index];

                    Premiacion_Olimpista::create([
                        'id_olimpista'   => $esGrupal ? null : $evaluado->id_olimpista,
                        'id_equipo'      => $esGrupal ? $evaluado->id_equipo : null,
                        'id_nivel'       => $id_nivel,
                        'id_tipo_premio' => $premio->id_tipo_premio,
                        'posicion'       => $index + 1,
                    ]);

                    // Guardamos la medalla temporalmente para usar en el reporte
                    $soloClasificados[$index]->medalla = $premio->nombre;

                    //     GENERAR RESPUESTA
                    if (!$esGrupal) {
                        $o = $evaluado->olimpista;

                        $premiados[] = [
                            'nombre'           => $o->nombre . ' ' . $o->apellidos,
                            'ci'               => $o->ci,
                            'institucion'      => $o->institucion,
                            'departamento'     => $o->departamento->nombre_departamento ?? null,
                            'area'             => $o->area->nombre ?? null,
                            'nivel'            => $o->nivel->nombre ?? null,
                            'tutor'            => $o->tutor['nombre'] ?? null,
                            'nota'             => $evaluado->nota,
                            'medalla'          => $premio->nombre,
                            'responsable_area' => $responsable->usuario->nombre . ' ' . $responsable->usuario->apellidos,
                        ];
                    } else {

                        $equipo = $evaluado->equipo;
                        $primerOlimpista = $equipo->olimpistas->first();
                        $tutorEquipo = $primerOlimpista?->tutor['nombre'] ?? null;
                        $premiados[] = [
                            'nombre'           => $equipo->nombre_equipo,
                            'institucion'      => $equipo->institucion,
                            'departamento'     => $primerOlimpista?->departamento?->nombre_departamento,
                            'area'             => $nivel->area->nombre,
                            'nivel'            => $nivel->nombre,
                            'tutor'            => $tutorEquipo,
                            'nota'             => $evaluado->nota,
                            'medalla'          => $premio->nombre,
                            'responsable_area' => $responsable->usuario->nombre . ' ' . $responsable->usuario->apellidos,
                            'integrantes'      => $equipo->olimpistas->map(fn($m) => [
                                'nombre' => $m->nombre . ' ' . $m->apellidos,
                                'ci'     => $m->ci
                            ])
                        ];
                    }

                    $index++;
                }
            }


            //  Clasificados sin medalla → medalla = null
            for ($j = $index; $j < count($soloClasificados); $j++) {
                $soloClasificados[$j]->medalla = null;
            }


            DB::commit();

            return response()->json([
                'success'   => 'Premios asignados correctamente.',
                'nivel'     => $nivel->nombre,
                'fase'      => $ultimaFase->id_fase,
                'premiados' => $premiados
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error'   => 'Error al asignar premiación.',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }
}
