<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('area')->truncate();
        DB::table('area')->insert([
            ['id_area' => 1, 'nombre' => 'Química'],
            ['id_area' => 2, 'nombre' => 'Física'],
            ['id_area' => 3, 'nombre' => 'Matemáticas'],
            ['id_area' => 4, 'nombre' => 'Biología'],
            ['id_area' => 5, 'nombre' => 'Informática'],
            ['id_area' => 6, 'nombre' => 'Robótica'],
            ['id_area' => 7, 'nombre' => 'Astronomía'],
            ['id_area' => 8, 'nombre' => 'Geografía'],
        ]);
    }
}
