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
        // El orden de ejecución es muy importante para las llaves foráneas.
        $this->call([
            // 1. Datos base (no dependen de nada)
            DepartamentoSeeder::class,
            RolSeeder::class,
            AreaSeeder::class,
            EstadoFaseSeeder::class,
            EstadoOlimpistaSeeder::class,
            FaseSeeder::class,
            
            // 2. Datos que dependen de los base
            NivelSeeder::class,         // <-- Depende de AreaSeeder

            // 3. Usuarios (dependen de Rol, Area, Nivel, etc.)
            AdminUserSeeder::class,
            EvaluadorSeeder::class, 
            ResponsableSeeder::class,
            
            // 4. El conector (DEPENDE DE TODO LO ANTERIOR)
            NivelFaseSeeder::class,     // <-- ¡AÑADIDO AL FINAL!
        ]);
    }
}