<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;
use App\Models\Area;
use App\Models\ResponsableArea;
use Illuminate\Support\Facades\Hash;

class ResponsableUserSeeder extends Seeder
{
    public function run(): void
    {
        $rol = Rol::where('nombre_rol', 'responsable')->first();
        // Asumimos que existe un Área con id=1 (creada por tu AreaSeeder)
        $area = Area::find(1); 

        if ($rol && $area) {
            // 1. Crear el registro de Usuario
            $user = User::firstOrCreate(
                ['email' => 'responsable@sansi.com'],
                [
                    'nombre' => 'Responsable',
                    'apellidos' => 'Area ' . $area->nombre,
                    'password' => Hash::make('password'),
                    'id_rol' => $rol->id_rol,
                    'telefono' => '11111111',
                    'ci' => '1111111',
                ]
            );

            // 2. Vincular el Usuario a su tabla de rol 'responsable'
            ResponsableArea::firstOrCreate(
                ['id_usuario' => $user->id_usuario],
                ['id_area' => $area->id_area]
            );
        }
    }
}