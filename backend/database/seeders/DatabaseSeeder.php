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
        // Esta sección debe llamar ÚNICAMENTE a los seeders que nosotros definimos.
        // Asegúrate de que no haya ninguna otra línea como User::factory()->create();
        $this->call([
            DepartamentoSeeder::class,
            RolSeeder::class,
            AreaSeeder::class,
            NivelSeeder::class,
            EstadoFaseSeeder::class,
            EstadoOlimpistaSeeder::class,
            // Seeders de usuarios (dependen de los anteriores)
            AdminUserSeeder::class,
            EvaluadorSeeder::class, // <-- AÑADIDO
            ResponsableSeeder::class, // <-- AÑADIDO
        ]);
    }
}
