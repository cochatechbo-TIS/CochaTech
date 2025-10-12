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
            ['id_area' => 1, 'nombre' => 'quimica'],
            ['id_area' => 2, 'nombre' => 'fisica'],
            ['id_area' => 3, 'nombre' => 'matematica'],
            ['id_area' => 4, 'nombre' => 'biologia'],
            ['id_area' => 5, 'nombre' => 'informatica'],
            ['id_area' => 6, 'nombre' => 'robotica'],
        ]);
    }
}
