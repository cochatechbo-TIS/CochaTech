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
            ],
            [
                'id_tipo_premio' => 2,
                'nombre' => 'Plata',
                'orden' => 2,
            ],
            [
                'id_tipo_premio' => 3,
                'nombre' => 'Bronce',
                'orden' => 3,
            ],
            [
                'id_tipo_premio' => 4,
                'nombre' => 'Mención',
                'orden' => 4,
            ],
        ]);
    }
}
