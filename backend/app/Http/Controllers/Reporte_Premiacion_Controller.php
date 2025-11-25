<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Models\Nivel;
use App\Models\Premiacion_Olimpista;
use App\Models\Tipo_Premio;
use App\Models\Medallero_Configuracion;
use App\Models\Nivel_Fase;
use App\Models\Responsable_Area;
use Illuminate\Http\Request;
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
        $nivel = Nivel::findOrFail($id_nivel);
        $esGrupal = $nivel->es_grupal;

        // 3. Obtener la última fase
        $ultimaFase = Nivel_Fase::where('id_nivel', $id_nivel)
            ->orderByDesc('id_nivel_fase')
            ->first();

        if (!$ultimaFase) {
            return response()->json(['error' => 'No hay fases registradas para este nivel'], 400);
        }

        // 4. Obtener evaluaciones con relaciones necesarias
        $evaluaciones = Evaluacion::with([
                'olimpista.departamento',
                'olimpista.area',
                'olimpista.nivel',
                'estadoOlimpista'
            ])
            ->where('id_nivel_fase', $ultimaFase->id_nivel_fase)
            ->when(!$esGrupal, fn($q) => $q->whereNotNull('id_olimpista'))
            ->when($esGrupal, fn($q) => $q->whereNotNull('id_equipo'))
            ->orderByDesc('nota')
            ->get();

        if ($evaluaciones->isEmpty()) {
            return response()->json(['error' => 'No hay evaluaciones.'], 400);
        }

        // 5. Configuración de medallas (cantidad por nivel)
        $config = Medallero_Configuracion::where('id_area', $id_area)
            ->get()
            ->keyBy('id_tipo_premio');

        if ($config->isEmpty()) {
            return response()->json(['error' => 'No existe configuración de medallas para esta área.'], 400);
        }

        // 6. Obtener tipos de premio
        $premios = Tipo_Premio::orderBy('orden')->get();
        if ($premios->isEmpty()) {
            return response()->json(['error' => 'No existen tipos de premio configurados.'], 400);
        }

        DB::beginTransaction();

        try {
            // 7. Eliminar premiaciones previas
            Premiacion_Olimpista::where('id_nivel', $id_nivel)->delete();

            $premiados = [];
            $index = 0;

            // 8. Asignar premios según la configuración
            foreach ($premios as $premio) {
                $cupos = $config[$premio->id_tipo_premio]->cantidad_por_nivel ?? 0;

                for ($i = 0; $i < $cupos; $i++) {
                    if (!isset($evaluaciones[$index])) break;

                    $evaluado = $evaluaciones[$index];
                    $olimpista = $evaluado->olimpista;

                    Premiacion_Olimpista::create([
                        'id_olimpista'   => $esGrupal ? null : $olimpista->id_olimpista,
                        'id_equipo'      => $esGrupal ? $evaluado->id_equipo : null,
                        'id_nivel'       => $id_nivel,
                        'id_tipo_premio' => $premio->id_tipo_premio,
                        'posicion'       => $index + 1,
                    ]);

                    if (!$esGrupal && $olimpista) {
                        $premiados[] = [
                            'nombre'           => $olimpista->nombre . ' ' . $olimpista->apellidos,
                            'ci'               => $olimpista->ci,
                            'institucion'      => $olimpista->institucion,
                            'departamento'     => $olimpista->departamento->nombre_departamento ?? null,
                            'area'             => $olimpista->area->nombre ?? null,
                            'nivel'            => $olimpista->nivel->nombre ?? null,
                            'tutor'            => $olimpista->tutor['nombre'] ?? null,
                            'nota'             => $evaluado->nota,
                            'medalla'          => $premio->nombre,
                            'responsable_area' => $responsable->usuario->nombre . ' ' . $responsable->usuario->apellidos,
                        ];
                    }

                    $index++;
                }
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
