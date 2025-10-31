<?php

namespace App\Http\Controllers;

use App\Models\Fase;
use App\Models\Nivel;
use App\Models\Nivel_Fase;
use App\Models\Evaluacion;
use App\Models\Olimpista;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class EvaluacionController extends Controller
{
    // Mostrar todas las fases
    public function index()
    {
        $fases = Fase::with('nivelFases.nivel')->get();
        return response()->json($fases);
    }

    // Mostrar una fase específica
    public function show($id)
    {
        $fase = Fase::with(['nivelFases.nivel', 'nivelFases.evaluaciones'])->findOrFail($id);
        return response()->json($fase);
    }

    // Crear la primera fase
    public function iniciarPrimeraFase()
    {
        DB::transaction(function () {
            $fase = Fase::create([
                'nombre' => 'Fase 1',
                'nota_minima' => 60,
                'iniciado_por' => auth()->id(),
                'iniciado_timestamp' => now(),
            ]);

            $niveles = Nivel::all();

            foreach ($niveles as $nivel) {
                $nivelFase = Nivel_Fase::create([
                    'id_fase' => $fase->id_fase,
                    'id_nivel' => $nivel->id_nivel,
                ]);

                $olimpistas = Olimpista::where('id_nivel', $nivel->id_nivel)->get();

                foreach ($olimpistas as $olimpista) {
                    Evaluacion::create([
                        'id_olimpista' => $olimpista->id_olimpista,
                        'id_nivel_fase' => $nivelFase->id_nivel_fase,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Primera fase creada exitosamente']);
    }

    // Generar la siguiente fase
    public function generarSiguienteFase($idFaseAnterior)
    {
        DB::transaction(function () use ($idFaseAnterior) {
            $faseAnterior = Fase::findOrFail($idFaseAnterior);

            $faseNueva = Fase::create([
                'nombre' => 'Fase ' . ($idFaseAnterior + 1),
                'nota_minima' => $faseAnterior->nota_minima,
                'iniciado_por' => auth()->id(),
                'iniciado_timestamp' => now(),
            ]);

            $nivelesFaseAnterior = Nivel_Fase::where('id_fase', $idFaseAnterior)->get();

            foreach ($nivelesFaseAnterior as $nivelFaseAnt) {
                $nivelFaseNuevo = Nivel_Fase::create([
                    'id_fase' => $faseNueva->id_fase,
                    'id_nivel' => $nivelFaseAnt->id_nivel,
                ]);

                $clasificados = Evaluacion::where('id_nivel_fase', $nivelFaseAnt->id_nivel_fase)
                    ->where('nota', '>=', $faseAnterior->nota_minima)
                    ->get();

                foreach ($clasificados as $eval) {
                    Evaluacion::create([
                        'id_olimpista' => $eval->id_olimpista,
                        'id_nivel_fase' => $nivelFaseNuevo->id_nivel_fase,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Siguiente fase creada exitosamente']);
    }
}
