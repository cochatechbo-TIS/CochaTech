<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    public function up(): void
    {
        DB::table('departamento')->insert([
            ['id_departamento' => 1, 'nombre_departamento' => 'La Paz'],
            ['id_departamento' => 2, 'nombre_departamento' => 'Santa Cruz'],
            ['id_departamento' => 3, 'nombre_departamento' => 'Cochabamba'],
            ['id_departamento' => 4, 'nombre_departamento' => 'Oruro'],
            ['id_departamento' => 5, 'nombre_departamento' => 'Potosí'],
            ['id_departamento' => 6, 'nombre_departamento' => 'Chuquisaca'],
            ['id_departamento' => 7, 'nombre_departamento' => 'Tarija'],
            ['id_departamento' => 8, 'nombre_departamento' => 'Beni'],
            ['id_departamento' => 9, 'nombre_departamento' => 'Pando'],
        ]);
    }

    public function down(): void
    {
        DB::table('departamento')->whereIn('id_departamento', [1,2,3,4,5,6,7,8,9])->delete();
    }
};
