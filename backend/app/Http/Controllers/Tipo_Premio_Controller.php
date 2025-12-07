<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tipo_Premio;
use Illuminate\Support\Facades\DB;

class Tipo_Premio_Controller extends Controller
{
    public function index()
    {
        return response()->json(
            Tipo_Premio::orderBy('orden')->get()
        );
    }

    public function actualizarNotasMasivas(Request $request)
    {
        $validated = $request->validate([
            'premios' => 'required|array',
            'premios.*.id_tipo_premio' => 'required|exists:tipo_premio,id_tipo_premio',
            'premios.*.nota_minima' => 'required|numeric|min:0|max:100',
            'premios.*.nota_maxima' => 'required|numeric|min:0|max:100',
        ]);

        $premios = collect($validated['premios'])
            ->map(function ($p) {
                $tipo = Tipo_Premio::find($p['id_tipo_premio']);

                return [
                    'id_tipo_premio' => $p['id_tipo_premio'],
                    'orden' => $tipo->orden,
                    'nombre' => $tipo->nombre,
                    'nota_minima' => $p['nota_minima'],
                    'nota_maxima' => $p['nota_maxima'],
                ];
            })
            ->sortBy('orden')
            ->values();

        foreach ($premios as $p) {
            if ($p['nota_minima'] > $p['nota_maxima']) {
                return response()->json([
                    'message' => "La nota mínima no puede ser mayor que la nota máxima ({$p['nombre']})"
                ], 422);
            }
        }

        for ($i = 0; $i < $premios->count() - 1; $i++) {
            $actual = $premios[$i];
            $siguiente = $premios[$i + 1];

            if ($actual['nota_minima'] <= $siguiente['nota_maxima']) {
                return response()->json([
                    'message' =>
                        "Conflicto entre {$actual['nombre']} y {$siguiente['nombre']}. " .
                        "El máximo de {$siguiente['nombre']} ({$siguiente['nota_maxima']}) " .
                        "debe ser menor que el mínimo de {$actual['nombre']} ({$actual['nota_minima']})."
                ], 422);
            }
        }

        $resultados = [];

        DB::transaction(function () use ($premios, &$resultados) {
            foreach ($premios as $p) {
                $premio = Tipo_Premio::find($p['id_tipo_premio']);
                $premio->update([
                    'nota_minima' => $p['nota_minima'],
                    'nota_maxima' => $p['nota_maxima'],
                ]);

                $resultados[] = $premio;
            }
        });

        return response()->json($resultados);
    }
}
