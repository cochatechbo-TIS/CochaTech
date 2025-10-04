<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('area')->insert([
            ['id_area' => 1, 'nombre_area' => 'Matemática'],
            ['id_area' => 2, 'nombre_area' => 'Física'],
            ['id_area' => 3, 'nombre_area' => 'Química'],
            ['id_area' => 4, 'nombre_area' => 'Biología'],
            ['id_area' => 5, 'nombre_area' => 'Astronomía'],
            ['id_area' => 6, 'nombre_area' => 'Geografía'],
            ['id_area' => 7, 'nombre_area' => 'Informática'],
        ]);
    }

    public function down(): void
    {
        DB::table('area')->whereIn('id_area', [1,2,3,4,5,6,7])->delete();
    }
};
