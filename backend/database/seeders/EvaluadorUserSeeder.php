<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Rol;
use App\Models\Area;
use App\Models\Nivel;
use App\Models\Evaluador;
use Illuminate\Support\Facades\Hash;

class EvaluadorUserSeeder extends Seeder
{
    public function run(): void
    {
        $rol = Rol::where('nombre_rol', 'evaluador')->first();
        // Asumimos que existen Área y Nivel con id=1
        $area = Area::find(1);
        $nivel = Nivel::find(1);

        if ($rol && $area && $nivel) {
            // 1. Crear el registro de Usuario
            $user = User::firstOrCreate(
                ['email' => 'evaluador@sansi.com'],
                [
                    'nombre' => 'Evaluador',
                    'apellidos' => 'Area ' . $area->nombre,
                    'password' => Hash::make('password'),
                    'id_rol' => $rol->id_rol,
                    'telefono' => '22222222',
                    'ci' => '2222222',
                ]
            );

            // 2. Vincular el Usuario a su tabla de rol 'evaluador'
            Evaluador::firstOrCreate(
                ['id_usuario' => $user->id_usuario],
                [
                    'id_area' => $area->id_area,
                    'id_nivel' => $nivel->id_nivel,
                    'disponible' => true
                ]
            );
        }
    }
}