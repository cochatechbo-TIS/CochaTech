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
        // 2. Obtener la última fase

        $ultimaFase = Nivel_Fase::where('id_nivel', $id_nivel)
            ->orderByDesc('id_nivel_fase')
            ->first();

        if (!$ultimaFase) {
            return response()->json(['error' => 'No hay fases registradas para este nivel'], 400);
        }

        $id_nivel_fase = $ultimaFase->id_nivel_fase;

        // 3. Obtener evaluaciones
        $evaluaciones = Evaluacion::with(['olimpista', 'estadoOlimpista'])
            ->where('id_nivel_fase', $id_nivel_fase)
            ->when(!$esGrupal, fn($q) => $q->whereNotNull('id_olimpista'))
            ->when($esGrupal, fn($q) => $q->whereNotNull('id_equipo'))
            ->orderByDesc('nota')
            ->get();

        if ($evaluaciones->isEmpty()) {
            return response()->json(['error' => 'No hay evaluaciones.'], 400);
        }

        // 4. Obtener la cantidad de medallas desde configuración

        $config = Medallero_Configuracion::where('id_area', $nivel->id_area)
            ->get()
            ->keyBy('id_tipo_premio');

        if ($config->isEmpty()) {
            return response()->json(['error' => 'No existe configuración de medallas para esta área.'], 400);
        }
        // 5. Obtener tipos premio
        $premios = Tipo_Premio::orderBy('orden')->get();

        // 6. Eliminar premiaciones anteriores

        Premiacion_Olimpista::where('id_nivel', $id_nivel)->delete();
        // 7. Asignar premios

        $index = 0;
        foreach ($premios as $premio) {

            // Tomar cantidad correcta desde la tabla medallero_configuracion
            $cupos = $config[$premio->id_tipo_premio]->cantidad_por_nivel ?? 0;

            for ($i = 0; $i < $cupos; $i++) {

                if (!isset($evaluaciones[$index])) break;

                $evaluado = $evaluaciones[$index];

                Premiacion_Olimpista::create([
                    'id_olimpista'   => $esGrupal ? null : $evaluado->id_olimpista,
                    'id_equipo'      => $esGrupal ? $evaluado->id_equipo : null,
                    'id_nivel'       => $id_nivel,
                    'id_tipo_premio' => $premio->id_tipo_premio,
                    'posicion' => $index + 1,
                ]);

                $evaluaciones[$index]->medalla = $premio->nombre;

                $index++;
            }
        }


        // A los que no recibieron premio
        for ($j = $index; $j < count($evaluaciones); $j++) {
            $evaluaciones[$j]->medalla = null;
        }

        // 8. Devolver resultados
        return response()->json([
            'nivel' => $nivel->nombre,
            'fase' => $ultimaFase->id_fase,
            'premiaciones' => $evaluaciones->map(function ($item) {
                $olimpista = $item->olimpista;
                return [
                    'nombre'        => $olimpista->nombre . ' ' . $olimpista->apellidos,
                    'ci'            => $olimpista->ci,
                    'institucion'   => $olimpista->institucion,
                    'nota'          => $item->nota,
                    'falta_etica'   => $item->falta_etica,
                    'observaciones' => $item->comentario,
                    'estado'        => $item->estadoOlimpista->nombre ?? null,
                    'medalla'       => $item->medalla,
                ];
            }),
        ]);
    }
}
