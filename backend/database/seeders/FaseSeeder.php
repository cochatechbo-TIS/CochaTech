<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fase;

class FaseSeeder extends Seeder
{
    public function run(): void
    {
        // Fase 1
        Fase::firstOrCreate(
            ['nombre' => 'Fase 1 - Clasificatoria'],
            [
                'orden' => 1,
                'nota_minima' => 51
            ]
        );

        // Fase 2
        Fase::firstOrCreate(
            ['nombre' => 'Fase 2 - Semifinal'],
            [
                'orden' => 2,
                'nota_minima' => 55
            ]
        );

        // Fase 3
        Fase::firstOrCreate(
            ['nombre' => 'Fase 3 - Final'],
            [
                'orden' => 3,
                'nota_minima' => 60
            ]
        );
    }
}
