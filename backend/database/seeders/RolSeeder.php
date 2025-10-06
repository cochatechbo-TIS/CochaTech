<?php

namespace Database\Seeders; // <-- Verifica que esta línea sea correcta

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Rol;

class RolSeeder extends Seeder // <-- Verifica que el nombre de la clase coincida con el del archivo
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Rol::firstOrCreate(['nombre_rol' => 'administrador']);
        Rol::firstOrCreate(['nombre_rol' => 'responsable']);
        Rol::firstOrCreate(['nombre_rol' => 'evaluador']);
    }
}
