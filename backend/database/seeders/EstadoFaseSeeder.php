<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Estado_Fase; // <-- Importar el modelo

class EstadoFaseSeeder extends Seeder
{
    public function run(): void
    {
        $estados = [
            // id_estado_fase se vuelve la llave primaria
            ['id_estado_fase' => 1, 'nombre_estado' => 'En Proceso'],
            ['id_estado_fase' => 2, 'nombre_estado' => 'Aprobada'],
            ['id_estado_fase' => 3, 'nombre_estado' => 'Rechazada'],
        ];

        foreach ($estados as $estado) {
            // Usamos updateOrCreate para insertar o actualizar basado en el ID
             Estado_Fase::updateOrCreate(
                ['id_estado_fase' => $estado['id_estado_fase']],
                ['nombre_estado' => $estado['nombre_estado']]
            );
        }
    }
}