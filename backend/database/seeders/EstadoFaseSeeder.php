<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoFaseSeeder extends Seeder
{
    public function run(): void
    {
        $estados = [
            ['id' => 1, 'nombre' => 'En Proceso'],
            ['id' => 2, 'nombre' => 'Aprobada'],
            ['id' => 3, 'nombre' => 'Rechazada'],
        ];

        foreach ($estados as $estado) {
            DB::statement('
                INSERT INTO estado_fase (id_estado_fase, nombre_estado)
                VALUES (?, ?)
                ON CONFLICT (id_estado_fase) DO NOTHING
            ', [$estado['id'], $estado['nombre']]);
        }

    }
}
