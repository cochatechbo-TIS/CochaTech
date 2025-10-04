<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('rol')->insert([
            ['id_rol' => 1, 'nombre_rol' => 'Administrador'],
            ['id_rol' => 2, 'nombre_rol' => 'Responsable de Area'],
            ['id_rol' => 3, 'nombre_rol' => 'Evaluador'],
        ]);
    }

    public function down(): void
    {
        DB::table('rol')->whereIn('id_rol', [1,2,3])->delete();
    }
};
