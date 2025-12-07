<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Models\Nivel;
use App\Models\Premiacion_Olimpista;
use App\Models\Tipo_Premio;
use App\Models\Medallero_Configuracion;
use App\Models\Nivel_Fase;
use Illuminate\Http\Request;

class Premiacion_Controller extends Controller
{
    public function asignarPremios($id_nivel)
    {
        // 1. Obtener nivel
        $nivel = Nivel::findOrFail($id_nivel);
        $esGrupal = $nivel->es_grupal;

        // 2. Última fase
        $ultimaFase = Nivel_Fase::where('id_nivel', $id_nivel)
            ->orderByDesc('id_nivel_fase')
            ->first();

        if (!$ultimaFase) {
            return response()->json(['error' => 'No hay fases registradas para este nivel'], 400);
        }

        $id_nivel_fase = $ultimaFase->id_nivel_fase;

        // 3. Evaluaciones completas
        $evaluaciones = Evaluacion::with(['olimpista', 'estadoOlimpista', 'equipo'])
            ->where('id_nivel_fase', $id_nivel_fase)
            ->when(!$esGrupal, fn($q) => $q->whereNotNull('id_olimpista'))
            ->when($esGrupal, fn($q) => $q->whereNotNull('id_equipo'))
            ->orderByDesc('nota')
            ->get();

        if ($evaluaciones->isEmpty()) {
            return response()->json(['error' => 'No hay evaluaciones.'], 400);
        }

        // 4. Filtrar solo clasificados
        $soloClasificados = $evaluaciones->filter(fn($eva) => strtolower($eva->estadoOlimpista->nombre ?? '') === 'clasificado')
                                         ->values();

        if ($soloClasificados->isEmpty()) {
            return response()->json(['error' => 'No hay participantes clasificados.'], 400);
        }

        // 5. Configuración de medallas
        $config = Medallero_Configuracion::where('id_area', $nivel->id_area)
            ->get()
            ->keyBy('id_tipo_premio');

        if ($config->isEmpty()) {
            return response()->json(['error' => 'No existe configuración de medallas para esta área.'], 400);
        }

        // 6. Tipos de premio ordenados
        $premios = Tipo_Premio::orderBy('orden')->get();

        // 7. Eliminar premiaciones anteriores
        Premiacion_Olimpista::where('id_nivel', $id_nivel)->delete();

        // 8. Asignar medallas con caída
        $premiados = [];
        $pos_global = 1; // posición global dentro del nivel

        foreach ($premios as $premio) {
            $cupos = $config[$premio->id_tipo_premio]->cantidad_por_nivel ?? 0;
            if ($cupos <= 0) continue;

            // Candidatos no premiados aún
            $restantes = $soloClasificados->filter(fn($eva) => !in_array($eva->id_evaluacion, $premiados))
                                          ->values();

            if ($restantes->isEmpty()) continue;

            // Evaluaciones dentro del rango del premio
            $in_range = $restantes->filter(fn($eva) => $eva->nota >= $premio->nota_minima && $eva->nota <= $premio->nota_maxima)
                                   ->sortByDesc('nota')
                                   ->values();

            // Evaluaciones por encima del rango → caerán a este premio si hay cupos
            $above_range = $restantes->filter(fn($eva) => $eva->nota > $premio->nota_maxima)
                                     ->sortByDesc('nota')
                                     ->values();

            // Concatenar: primero los que sobrepasaron rango, luego los que están dentro
            $candidatos = $above_range->concat($in_range)->values();

            for ($i = 0; $i < $cupos; $i++) {
                if (!isset($candidatos[$i])) break;

                $evaluado = $candidatos[$i];

                Premiacion_Olimpista::create([
                    'id_olimpista'   => $esGrupal ? null : $evaluado->id_olimpista,
                    'id_equipo'      => $esGrupal ? $evaluado->id_equipo : null,
                    'id_nivel'       => $id_nivel,
                    'id_tipo_premio' => $premio->id_tipo_premio,
                    'posicion'       => $pos_global, // posición global
                ]);

                $premiados[] = $evaluado->id_evaluacion;
                $evaluado->medalla = $premio->nombre;
                $pos_global++;
            }
        }

        // 9. Asignar null a clasificados sin medalla
        $soloClasificados->each(fn($eva) => $eva->medalla = in_array($eva->id_evaluacion, $premiados) ? $eva->medalla : null);

        // 10. Orden final
        $todosOrdenados = $evaluaciones->map(function ($item) use ($esGrupal) {
            $estadoNombre = strtolower($item->estadoOlimpista->nombre ?? '');
            $isClasificado = $estadoNombre === 'clasificado';
            $medalla = $isClasificado ? ($item->medalla ?? null) : null;

            $data = $esGrupal
                ? [
                    'nombre' => $item->equipo->nombre_equipo,
                    'ci' => null,
                    'institucion' => $item->equipo->institucion,
                ]
                : [
                    'nombre' => $item->olimpista->nombre . ' ' . $item->olimpista->apellidos,
                    'ci' => $item->olimpista->ci,
                    'institucion' => $item->olimpista->institucion,
                ];

            return array_merge($data, [
                'nota' => $item->nota,
                'falta_etica' => $item->falta_etica,
                'observaciones' => $item->comentario,
                'estado' => $item->estadoOlimpista->nombre ?? null,
                'medalla' => $medalla,
            ]);
        })->sortByDesc(fn($item) => !is_null($item['medalla']) ? 4 :
                                    (strtolower($item['estado'] ?? '') === 'clasificado' ? 3 :
                                    (strtolower($item['estado'] ?? '') === 'no clasificado' ? 2 : 
                                    (strtolower($item['estado'] ?? '') === 'desclasificado' ? 1 : 0))))
          ->values();

        return response()->json([
            'nivel' => $nivel->nombre,
            'fase' => $ultimaFase->id_fase,
            'premiaciones' => $todosOrdenados
        ]);
    }
}
