<?php

namespace App\Http\Controllers;

use App\Models\Fase;
use Illuminate\Http\Request;

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
        )->get();

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

}
