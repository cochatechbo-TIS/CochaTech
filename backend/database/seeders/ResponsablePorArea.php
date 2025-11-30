<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResponsablePorArea extends Seeder
{
    public function run(): void
    {
        $usuarios = [
            [
                'nombre' => 'Camilo',
                'apellidos' => 'García López',
                'ci' => '12345678',
                'email' => 'carlos.garcia@example.com',
                'password' => Hash::make('password'),
                'telefono' => '61234567',
                'id_rol' => 2, 
                'id_area' => 2, 
            ],
            [
                'nombre' => 'Marta',
                'apellidos' => 'Fernández Pérez',
                'ci' => '87654321',
                'email' => 'maria.fernandez@example.com',
                'password' => Hash::make('password'),
                'telefono' => '69876543',
                'id_rol' => 2,
                'id_area' => 3, 
            ],
            [
                'nombre' => 'Jimmy',
                'apellidos' => 'Ramírez Torres',
                'ci' => '11223344',
                'email' => 'jorge.ramirez@example.com',
                'password' => Hash::make('password'),
                'telefono' => '60112233',
                'id_rol' => 2,
                'id_area' => 4, 
            ],
        ];

        foreach ($usuarios as $usuario) {
            
            $id_area = $usuario['id_area'];
            unset($usuario['id_area']); 

            $id_usuario = DB::table('usuario')->insertGetId(
                array_merge($usuario, ['fecha_registro' => now()]),
                'id_usuario'
            );

            DB::table('responsable')->insert([
                'id_usuario' => $id_usuario,
                'id_area' => $id_area,
            ]);
        }

    }
}
