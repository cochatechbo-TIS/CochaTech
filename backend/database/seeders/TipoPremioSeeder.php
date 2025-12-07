<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoPremioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tipo_premio')->insert([
            [
                'id_tipo_premio' => 1,
                'nombre' => 'Oro',
                'orden' => 1,
                'nota_minima' => 90,
                'nota_maxima' => 100,
            ],
            [
                'id_tipo_premio' => 2,
                'nombre' => 'Plata',
                'orden' => 2,
                'nota_minima' => 80,
                'nota_maxima' => 89,
            ],
            [
                'id_tipo_premio' => 3,
                'nombre' => 'Bronce',
                'orden' => 3,
                'nota_minima' => 70,
                'nota_maxima' => 79,
            ],
            [
                'id_tipo_premio' => 4,
                'nombre' => 'Mención',
                'orden' => 4,
                'nota_minima' => 65,
                'nota_maxima' => 69,
            ],
        ]);
    }
}
