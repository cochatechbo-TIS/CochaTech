<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoOlimpistaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('estado_olimpista')->insert([
            ['nombre' => 'Clasificado'],
            ['nombre' => 'No Clasificado'],
            ['nombre' => 'Desclasificado'],
        ]);
    }
}
