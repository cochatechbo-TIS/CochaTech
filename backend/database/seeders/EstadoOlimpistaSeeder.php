<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoOlimpistaSeeder extends Seeder
{
    public function run(): void
    {
        $estados = ['Clasificado', 'No Clasificado', 'Desclasificado'];

        foreach ($estados as $nombre) {
            DB::statement('
                INSERT INTO estado_olimpista (nombre) 
                VALUES (?) 
                ON CONFLICT (nombre) DO NOTHING
            ', [$nombre]);
        }
    }
}
