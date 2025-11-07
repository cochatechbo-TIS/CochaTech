<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\Rol;
use App\Models\Responsable_Area;
use App\Models\Area;
use Illuminate\Support\Facades\Hash;

class ResponsableSeeder extends Seeder
{
    public function run(): void
    {
        $responsableRole = Rol::where('nombre_rol', 'responsable')->first();
        $firstArea = Area::first(); // Asume que ya existen áreas

        if ($responsableRole && $firstArea) {
            // 1. Crear el Usuario
            $user = Usuario::firstOrCreate(
                ['email' => 'responsable@sansi.com'],
                [
                    'nombre' => 'Responsable',
                    'apellidos' => 'Demo',
                    'password' => Hash::make('password'),
                    'id_rol' => $responsableRole->id_rol,
                    'telefono' => '22222222',
                    'ci' => '2222222',
                ]
            );

            // 2. Crear la entrada de Responsable_Area asociada
            Responsable_Area::firstOrCreate(
                ['id_usuario' => $user->id_usuario],
                [
                    'id_area' => $firstArea->id_area,
                ]
            );
        }
    }
}
