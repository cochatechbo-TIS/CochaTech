<?php

namespace Database\Seeders; // <-- Namespace correcto

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;

class AdminUserSeeder extends Seeder // <-- Nombre de clase correcto
{
    public function run(): void
    {
        $adminRole = Rol::where('nombre_rol', 'administrador')->first();

        if ($adminRole) {
            User::firstOrCreate(
                ['email' => 'admin@sansi.com'],
                [
                    'nombre' => 'Admin',
                    'apellidos' => 'Principal',
                    'password' => 'password',
                    'id_rol' => $adminRole->id_rol,
                    'telefono' => '00000000',
                    'ci' => '1234567',
                    'area' => 'Administración'
                ]
            );
        }
    }
}