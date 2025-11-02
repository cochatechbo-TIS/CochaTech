<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fase;

class FaseSeeder extends Seeder
{
    public function run(): void
    {
        Fase::firstOrCreate(
            ['nombre' => 'Fase 1 - Clasificatoria'],
            ['nota_minima' => 51, 'orden' => 1] // <-- Orden añadido
        );

        Fase::firstOrCreate(
            ['nombre' => 'Fase 2 - Semifinal'],
            ['nota_minima' => 55, 'orden' => 2] // <-- Orden añadido
        );

        Fase::firstOrCreate(
            ['nombre' => 'Fase 3 - Final'],
            ['nota_minima' => 60, 'orden' => 3] // <-- Orden añadido
        );
    }
}