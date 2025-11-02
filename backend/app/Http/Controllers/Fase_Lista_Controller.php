<?php

namespace App\Http\Controllers;

use App\Models\Nivel_Fase;
use Illuminate\Http\Request;

class Fase_Lista_Controller extends Controller
{
    public function listarFasesPorNivel($idNivel)
    {
        $fases = Nivel_Fase::with(['fase', 'estado_fase'])
            ->where('id_nivel', $idNivel)
            ->orderBy('id_nivel_fase', 'asc')
            ->get()
            ->map(function ($nf) {
                return [
                    'id_nivel_fase' => $nf->id_nivel_fase,
                    'nombre_fase'   => $nf->fase->nombre,
                    'orden'         => $nf->fase->orden,
                    'estado'        => $nf->estado_fase->nombre_estado ?? 'Desconocido',
                    //'comentario'    => $nf->comentario ?? '', 
                ];
            });

        if ($fases->isEmpty()) {
            return response()->json(['message' => 'No hay fases registradas para este nivel.'], 404);
        }

        return response()->json([
            'id_nivel'     => $idNivel,
            'total_fases'  => $fases->count(),
            'fases'        => $fases
        ]);
    }
}
