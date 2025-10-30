<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fase; // <-- Importar el modelo

class FaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usamos firstOrCreate para evitar duplicados si lo corres varias veces
        Fase::firstOrCreate(
            ['nombre' => 'Fase 1 - Clasificatoria'],
            ['nota_minima' => 51]
        );
        
        Fase::firstOrCreate(
            ['nombre' => 'Fase 2 - Semifinal'],
            ['nota_minima' => 55]
        );
        
        Fase::firstOrCreate(
            ['nombre' => 'Fase 3 - Final'],
            ['nota_minima' => 60]
        );
    }
}