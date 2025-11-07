<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario; // <-- CORREGIDO
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Rol::where('nombre_rol', 'administrador')->first();

        if ($adminRole) {

            Usuario::firstOrCreate( // <-- CORREGIDO

                ['email' => 'admin@sansi.com'],
                [
                    'nombre' => 'Admin',
                    'apellidos' => 'Principal',
                    'password' => Hash::make('password'),
                    'id_rol' => $adminRole->id_rol,
                    'telefono' => '00000000',
                    'ci' => '1234567',
                ]
            );
        }
    }
}
