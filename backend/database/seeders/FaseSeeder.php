<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('fase')->insert([
            [
                'nombre' => 'Fase 1',
                'nota_minima' => 51,
                'iniciado_por' => null,
                'iniciado_timestamp' => null,
                'finalizado_por' => null,
                'finalizado_timestamp' => null,
            ],
            [
                'nombre' => 'Fase 2',
                'nota_minima' => 55,
                'iniciado_por' => null,
                'iniciado_timestamp' => null,
                'finalizado_por' => null,
                'finalizado_timestamp' => null,
            ],
            [
                'nombre' => 'Fase Final',
                'nota_minima' => 60,
                'iniciado_por' => null,
                'iniciado_timestamp' => null,
                'finalizado_por' => null,
                'finalizado_timestamp' => null,
            ],
        ]);
    }
}
