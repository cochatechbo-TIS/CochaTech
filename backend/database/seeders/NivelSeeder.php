<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NivelSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('nivel')->insert([
            ['id_nivel' => 1, 'nombre' => 'nivel 1'],
            ['id_nivel' => 2, 'nombre' => 'nivel 2'],
            ['id_nivel' => 3, 'nombre' => 'nivel 3'],
        ]);
    }
}
