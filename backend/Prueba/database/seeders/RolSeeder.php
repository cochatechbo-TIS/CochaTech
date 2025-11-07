<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        // Vaciar la tabla antes de insertar (opcional si quieres IDs fijos)
        DB::table('rol')->truncate();

        DB::table('rol')->insert([
            ['id_rol' => 1, 'nombre_rol' => 'administrador'],
            ['id_rol' => 2, 'nombre_rol' => 'responsable'],
            ['id_rol' => 3, 'nombre_rol' => 'evaluador'],
        ]);
    }
}
