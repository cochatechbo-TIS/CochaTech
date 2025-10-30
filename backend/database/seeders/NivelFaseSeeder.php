<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Nivel;
use App\Models\Fase;
use App\Models\Estado_Fase;
use App\Models\Nivel_Fase; // <-- Importante

class NivelFaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Obtenemos todos los niveles y todas las fases
        $niveles = Nivel::all();
        $fases = Fase::all();

        // 2. Obtenemos el estado por defecto "En Proceso"
        //    (Basado en tu EstadoFaseSeeder)
        $estadoPorDefecto = Estado_Fase::where('nombre_estado', 'En Proceso')->first();

        // Si no existe el estado, detenemos el seeder
        if (!$estadoPorDefecto) {
            $this->command->error('El estado "En Proceso" no se encuentra. Ejecuta EstadoFaseSeeder primero.');
            return;
        }

        // 3. Hacemos el "cruce": conectamos CADA nivel con CADA fase
        foreach ($niveles as $nivel) {
            foreach ($fases as $fase) {
                
                Nivel_Fase::firstOrCreate(
                    [
                        'id_nivel' => $nivel->id_nivel,
                        'id_fase' => $fase->id_fase,
                    ],
                    [
                        'id_estado_fase' => $estadoPorDefecto->id_estado_fase,
                        'comentario' => null
                    ]
                );
            }
        }
    }
}