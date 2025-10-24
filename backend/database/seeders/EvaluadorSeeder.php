<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario; // Usaremos este basado en tu AdminUserSeeder
use App\Models\Rol;
use App\Models\Evaluador;
use App\Models\Area;
use App\Models\Nivel;
use Illuminate\Support\Facades\Hash;

class EvaluadorSeeder extends Seeder
{
    public function run(): void
    {
        $evaluadorRole = Rol::where('nombre_rol', 'evaluador')->first();
        $firstArea = Area::first(); // Asume que ya existen áreas
        $firstNivel = Nivel::first(); // Asume que ya existen niveles

        if ($evaluadorRole && $firstArea && $firstNivel) {
            // 1. Crear el Usuario
            $user = Usuario::firstOrCreate(
                ['email' => 'evaluador@sansi.com'],
                [
                    'nombre' => 'Evaluador',
                    'apellidos' => 'Demo',
                    'password' => Hash::make('password'),
                    'id_rol' => $evaluadorRole->id_rol,
                    'telefono' => '11111111',
                    'ci' => '1111111',
                ]
            );

            // 2. Crear la entrada de Evaluador asociada
            Evaluador::firstOrCreate(
                ['id_usuario' => $user->id_usuario],
                [
                    'id_area' => $firstArea->id_area,
                    'id_nivel' => $firstNivel->id_nivel,
                    'disponible' => true,
                ]
            );
        }
    }
}