<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Rol; // <-- Importa el modelo Rol

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Busca un rol al azar para asignarlo al usuario de prueba
        $rol = Rol::inRandomOrder()->first();

        return [
            // CORREGIDO: Usa 'nombre' y 'apellidos' en lugar de 'name'
            'nombre' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            // CORREGIDO: Asigna un id_rol válido
            'id_rol' => $rol->id_rol,
            // AÑADIDO: Rellena los otros campos
            'telefono' => fake()->phoneNumber(),
            'activo' => true,
        ];
    }
}
