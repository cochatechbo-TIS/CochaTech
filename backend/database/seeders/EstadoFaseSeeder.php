<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoFaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('estado_fase')->insert([
            ['nombre_estado' => 'En Proceso'],
            ['nombre_estado' => 'Completado'],
            ['nombre_estado' => 'Pendiente'],
        ]);
    }
}
