<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NivelSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['id_area' => 1, 'nombre' => 'Q'],
            ['id_area' => 2, 'nombre' => 'F'],
            ['id_area' => 3, 'nombre' => 'M'],
            ['id_area' => 4, 'nombre' => 'B'],
            ['id_area' => 5, 'nombre' => 'I'],
            ['id_area' => 6, 'nombre' => 'R'],
            ['id_area' => 7, 'nombre' => 'A'],
            ['id_area' => 8, 'nombre' => 'G'],
        ];

        $niveles = [];

        foreach ($areas as $area) {
            // Niveles individuales
            for ($i = 1; $i <= 3; $i++) {
                $niveles[] = [
                    'nombre' => "{$area['nombre']}-Nivel {$i}",
                    'id_area' => $area['id_area'],
                    'id_evaluador' => null,
                    'es_grupal' => false,
                ];
            }

            // Niveles grupales
            for ($i = 1; $i <= 2; $i++) {
                $niveles[] = [
                    'nombre' => "{$area['nombre']}-Grupal {$i}",
                    'id_area' => $area['id_area'],
                    'id_evaluador' => null,
                    'es_grupal' => true,
                ];
            }
        }

        DB::table('nivel')->insert($niveles);
    }
}
