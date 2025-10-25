<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoFaseSeeder extends Seeder
{
    public function run(): void
    {
        $estados = ['En Proceso', 'Completado', 'Pendiente'];

        foreach ($estados as $nombre) {
            DB::statement('
                INSERT INTO estado_fase (nombre_estado) 
                VALUES (?) 
                ON CONFLICT (nombre_estado) DO NOTHING
            ', [$nombre]);
        }
    }
}
