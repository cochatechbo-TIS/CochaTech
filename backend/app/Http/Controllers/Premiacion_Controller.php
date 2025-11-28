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

        // 2. Obtener última fase
        $ultimaFase = Nivel_Fase::where('id_nivel', $id_nivel)
            ->orderByDesc('id_nivel_fase')
            ->first();

        if (!$ultimaFase) {
            return response()->json(['error' => 'No hay fases registradas para este nivel'], 400);
        }

        $id_nivel_fase = $ultimaFase->id_nivel_fase;

        // 3. Obtener evaluaciones completas
        $evaluaciones = Evaluacion::with(['olimpista', 'estadoOlimpista', 'equipo'])
            ->where('id_nivel_fase', $id_nivel_fase)
            ->when(!$esGrupal, fn($q) => $q->whereNotNull('id_olimpista'))
            ->when($esGrupal, fn($q) => $q->whereNotNull('id_equipo'))
            ->orderByDesc('nota')
            ->get();

        if ($evaluaciones->isEmpty()) {
            return response()->json(['error' => 'No hay evaluaciones.'], 400);
        }

        //  FILTRAR SOLO CLASIFICADOS
        $soloClasificados = $evaluaciones->filter(function ($eva) {
            return strtolower($eva->estadoOlimpista->nombre ?? '') === 'clasificado';
        })->values();

        if ($soloClasificados->isEmpty()) {
            return response()->json(['error' => 'No hay participantes clasificados.'], 400);
        }

        // 4. Configuración de medallas
        $config = Medallero_Configuracion::where('id_area', $nivel->id_area)
            ->get()
            ->keyBy('id_tipo_premio');

        if ($config->isEmpty()) {
            return response()->json(['error' => 'No existe configuración de medallas para esta área.'], 400);
        }

        // 5. Tipos premio
        $premios = Tipo_Premio::orderBy('orden')->get();

        // 6. Eliminar premiaciones anteriores
        Premiacion_Olimpista::where('id_nivel', $id_nivel)->delete();

        // 7. Asignar medallas SOLO a clasificados
        $index = 0;
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

                $soloClasificados[$index]->medalla = $premio->nombre;

                $index++;
            }
        }

        // Clasificados sin medalla
        for ($j = $index; $j < count($soloClasificados); $j++) {
            $soloClasificados[$j]->medalla = null;
        }

        //     ORDENAR RESULTADO FINAL
        $todosOrdenados = $evaluaciones->map(function ($item) use ($esGrupal) {

            $estadoNombre = strtolower($item->estadoOlimpista->nombre ?? '');
            $isClasificado = $estadoNombre === 'clasificado';

            $medalla = $isClasificado ? ($item->medalla ?? null) : null;

            $data = [];

            if ($esGrupal) {
                $equipo = $item->equipo;
                $data = [
                    'nombre'        => $equipo->nombre_equipo,
                    'ci'            => null,
                    'institucion'   => $equipo->institucion,
                ];
            } else {
                $ol = $item->olimpista;
                $data = [
                    'nombre'        => $ol->nombre . ' ' . $ol->apellidos,
                    'ci'            => $ol->ci,
                    'institucion'   => $ol->institucion,
                ];
            }

            return array_merge($data, [
                'nota'          => $item->nota,
                'falta_etica'   => $item->falta_etica,
                'observaciones' => $item->comentario,
                'estado'        => $item->estadoOlimpista->nombre ?? null,
                'medalla'       => $medalla,
            ]);

        })
       ->sortByDesc(function ($item) {

            $estado = strtolower($item['estado'] ?? '');

            //  Ganaron medalla
            if (!is_null($item['medalla'])) return 4;

            // Clasificados sin medalla
            if ($estado === 'clasificado') return 3;

            //  No clasificados (pero NO desclasificados)
            if ($estado === 'no clasificado') return 2;

            //  Desclasificados (van al último)
            if ($estado === 'desclasificado') return 1;

            // Si aparece algún otro estado raro → al fondo
            return 0;
        })

        ->values();

        //        RESPUESTA FINAL

        return response()->json([
            'nivel' => $nivel->nombre,
            'fase'  => $ultimaFase->id_fase,
            'premiaciones' => $todosOrdenados
        ]);
    }
}
