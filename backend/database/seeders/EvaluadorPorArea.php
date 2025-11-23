<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EvaluadorPorArea extends Seeder
{
    public function run(): void
    {
        // 2 evaluadores por área
        $evaluadores = [
            1 => [
                ['nombre' => 'María Fernanda', 'apellidos' => 'Rojas López'],
                ['nombre' => 'Carlos Eduardo', 'apellidos' => 'Soria Aguilar'],
            ],
            2 => [
                ['nombre' => 'Gabriela', 'apellidos' => 'Mendoza Flores'],
                ['nombre' => 'Jorge', 'apellidos' => 'Villalba Rocha'],
            ],
            3 => [
                ['nombre' => 'Andrea', 'apellidos' => 'Nina Torres'],
                ['nombre' => 'Luis Alberto', 'apellidos' => 'Guzmán Romero'],
            ],
            4 => [
                ['nombre' => 'Paola', 'apellidos' => 'Navarro Vargas'],
                ['nombre' => 'Miguel Ángel', 'apellidos' => 'Salinas Pinto'],
            ],
            5 => [
                ['nombre' => 'Brenda', 'apellidos' => 'Mamani Quispe'],
                ['nombre' => 'Sergio', 'apellidos' => 'Cárdenas Ortega'],
            ],
            6 => [
                ['nombre' => 'Valeria', 'apellidos' => 'Mercado Flores'],
                ['nombre' => 'Diego', 'apellidos' => 'Gutiérrez Ríos'],
            ],
            7 => [
                ['nombre' => 'Elena', 'apellidos' => 'Camacho Herrera'],
                ['nombre' => 'Rodrigo', 'apellidos' => 'Crespo Álvarez'],
            ],
            8 => [
                ['nombre' => 'Natalia', 'apellidos' => 'Ribera Cortez'],
                ['nombre' => 'Mauricio', 'apellidos' => 'Fernández Rivas'],
            ],
        ];

        $idRolEvaluador = 3; //id rol

        foreach ($evaluadores as $idArea => $lista) {

            foreach ($lista as $index => $ev) {

                // Crear usuario
               $userId = DB::table('usuario')->insertGetId([
                    'nombre' => $ev['nombre'],
                    'apellidos' => $ev['apellidos'],
                    'ci' => (string) rand(1000000, 9999999),
                    'email' => strtolower(str_replace(' ', '', $ev['nombre'])) . $idArea . ($index+1) . '@example.com',
                    'password' => Hash::make('password123'),
                    'telefono' => '7' . rand(1000000, 9999999),
                    'id_rol' => $idRolEvaluador,
                    'fecha_registro' => now(),
                ], 'id_usuario'); 


                // Crear evaluador
                DB::table('evaluador')->insert([
                    'id_usuario' => $userId,
                    'id_area' => $idArea,
                    'max_olimpistas' => 30,
                    'created_at' => now(),
                ]);
            }
        }
    }
}
