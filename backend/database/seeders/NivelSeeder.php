<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Nivel; // <-- Importar el modelo

class NivelSeeder extends Seeder
{
    public function run(): void
    {
        // Usamos los códigos cortos que tu CSV espera
        $areas = [
            ['id_area' => 1, 'codigo' => 'Q'],
            ['id_area' => 2, 'codigo' => 'F'],
            ['id_area' => 3, 'codigo' => 'M'],
            ['id_area' => 4, 'codigo' => 'B'],
            ['id_area' => 5, 'codigo' => 'I'],
            ['id_area' => 6, 'codigo' => 'R'],
            ['id_area' => 7, 'codigo' => 'A'],
            ['id_area' => 8, 'codigo' => 'G'],
        ];

        foreach ($areas as $area) {
            
            // --- NIVELES INDIVIDUALES (Nivel 1, 2, 3) ---
            for ($i = 1; $i <= 3; $i++) {
                Nivel::firstOrCreate(
                    [
                        'nombre' => "{$area['codigo']}-Nivel {$i}", // Ej: "Q-Nivel 1"
                        'id_area' => $area['id_area'],
                        'es_grupal' => false
                    ],
                    [
                        'id_evaluador' => null 
                    ]
                );
            }

            // --- NIVELES GRUPALES (Grupal 1, 2) ---
            // Tu CSV también busca "R-Grupal 1", "F-Grupal 2", etc.
            for ($i = 1; $i <= 2; $i++) {
                Nivel::firstOrCreate(
                    [
                        'nombre' => "{$area['codigo']}-Grupal {$i}", // Ej: "R-Grupal 1"
                        'id_area' => $area['id_area'],
                        'es_grupal' => true
                    ],
                    [
                        'id_evaluador' => null
                    ]
                );
            }
        }
    }
}