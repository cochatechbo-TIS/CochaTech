<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {

        $this->call([

            DepartamentoSeeder::class,
            RolSeeder::class,
            AreaSeeder::class,
            EstadoFaseSeeder::class,
            EstadoOlimpistaSeeder::class,
            FaseSeeder::class,
            NivelSeeder::class,         

            AdminUserSeeder::class,
            EvaluadorSeeder::class, 
            ResponsableSeeder::class,
            EvaluadorPorArea::class,
            TipoPremioSeeder::class,
            ResponsablePorArea::class,
        ]);
    }
}