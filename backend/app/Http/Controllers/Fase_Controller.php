<?php

namespace App\Http\Controllers;

use App\Models\Fase;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class Fase_Controller extends Controller
{
    public function index()
    {
        $fases = Fase::select(
            'id_fase',
            'nombre',
            'orden',
            'nota_minima',
            'fecha_inicio',
            'fecha_fin'
        ) ->orderBy('orden', 'asc') 
            ->get();

        return response()->json($fases, 200);
    }

   public function actualizarFechas(Request $request, $id_fase)
{
    $request->validate([
        'fecha_inicio' => 'required|date',
        'fecha_fin'    => 'required|date|after_or_equal:fecha_inicio',
    ]);

    $fase = Fase::find($id_fase);

    if (!$fase) {
        return response()->json([
            "error" => "La fase no existe."
        ], 404);
    }
    //  para que la fase 1 solo se pongan fechas de hoy para adelante
    if ($fase->orden == 1) {
        $hoy = now()->toDateString();

        if ($request->fecha_inicio < $hoy) {
            return response()->json([
                "error" => "La fecha de inicio de la fase 1 no puede ser menor a la fecha actual.",
                "detalle" => "Fecha ingresada: {$request->fecha_inicio}, fecha mínima: $hoy"
            ], 422);
        }
    }

    //  no se deben cruzar las fechas con los demas 
    $otrasFases = Fase::where('id_fase', '!=', $id_fase)->get();

    foreach ($otrasFases as $otra) {
        // veo si se solapan los rangos
        $solapa =
            ($request->fecha_inicio <= $otra->fecha_fin) &&
            ($request->fecha_fin >= $otra->fecha_inicio);

        if ($solapa) {
            return response()->json([
                "error" => "Las fechas ingresadas se solapan con otra fase.",
                "detalle" => [
                    "fase_en_conflicto" => $otra->id_fase,
                    "nombre" => $otra->nombre,
                    "rango_existente" => "{$otra->fecha_inicio} - {$otra->fecha_fin}"
                ]
            ], 422);
        }
    }

    // Actualizar datos
    $fase->update([
        'fecha_inicio' => $request->fecha_inicio,
        'fecha_fin'    => $request->fecha_fin,
    ]);

    return response()->json([
        "message" => "Fechas actualizadas correctamente",
        "fase"    => $fase
    ], 200);
}

public function actualizarFechasMasivo(Request $request)
{
    $request->validate([
        'fases' => 'required|array|min:1',
        'fases.*.id_fase' => 'required|exists:fase,id_fase',
        'fases.*.fecha_inicio' => 'required|date_format:Y-m-d H:i:s',
        'fases.*.fecha_fin' => 'required|date_format:Y-m-d H:i:s',
    ]);

    $fasesData = $request->fases;

    // Obtener fases desde BD
    $fasesBD = Fase::whereIn('id_fase', collect($fasesData)->pluck('id_fase'))
        ->get()
        ->keyBy('id_fase');

    //  Validaciones por fase
    foreach ($fasesData as $faseData) {

        $fase = $fasesBD[$faseData['id_fase']];

        $inicio = Carbon::parse($faseData['fecha_inicio']);
        $fin    = Carbon::parse($faseData['fecha_fin']);

        // fecha fin no menor a inicio
        if ($fin->lt($inicio)) {
            return response()->json([
                "error" => "La fecha fin no puede ser menor a la fecha inicio",
                "fase" => $faseData['id_fase']
            ], 422);
        }

        // fase 1: desde ahora (fecha + hora)
        if ($fase->orden == 1) {
            $ahora = Carbon::now();

            if ($inicio->lt($ahora)) {
                return response()->json([
                    "error" => "La fase 1 no puede iniciar en una fecha y hora pasada",
                    "detalle" => [
                        "fecha_ingresada" => $inicio->toDateTimeString(),
                        "fecha_minima" => $ahora->toDateTimeString()
                    ]
                ], 422);
            }
        }
    }

    // Verificar solapamientos
    $rangos = [];

    foreach ($fasesData as $faseData) {

        $inicio = Carbon::parse($faseData['fecha_inicio']);
        $fin    = Carbon::parse($faseData['fecha_fin']);

        foreach ($rangos as $rango) {

            $solapa = $inicio->lte($rango['fin']) && $fin->gte($rango['inicio']);

            if ($solapa) {
                return response()->json([
                    "error" => "Las fechas se solapan entre fases",
                    "detalle" => [
                        "fase_1" => $rango['id_fase'],
                        "fase_2" => $faseData['id_fase']
                    ]
                ], 422);
            }
        }

        $rangos[] = [
            'id_fase' => $faseData['id_fase'],
            'inicio'  => $inicio,
            'fin'     => $fin,
        ];
    }

    //  Guardar todo (transacción)

    DB::transaction(function () use ($fasesData) {
        foreach ($fasesData as $faseData) {
            Fase::where('id_fase', $faseData['id_fase'])
                ->update([
                    'fecha_inicio' => $faseData['fecha_inicio'],
                    'fecha_fin'    => $faseData['fecha_fin'],
                ]);
        }
    });

    return response()->json([
        "message" => "Todas las fases fueron actualizadas correctamente"
    ], 200);
}

}
