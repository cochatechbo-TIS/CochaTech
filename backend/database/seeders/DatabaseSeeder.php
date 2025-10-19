<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DepartamentoSeeder::class,
            RolSeeder::class,
            AreaSeeder::class,     // <-- Debe ir antes de los usuarios
            NivelSeeder::class,    // <-- Debe ir antes de los usuarios
            
            // Usuarios
            AdminUserSeeder::class,
            ResponsableUserSeeder::class, // <-- AÑADIDO
            EvaluadorUserSeeder::class,   // <-- AÑADIDO
        ]);
    }
}