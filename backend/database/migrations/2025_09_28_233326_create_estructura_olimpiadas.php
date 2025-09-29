<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla rol
        Schema::create('rol', function (Blueprint $table) {
            $table->id('id_rol');
            $table->string('nombre_rol', 50)->unique();
        });

        // Tabla departamento
        Schema::create('departamento', function (Blueprint $table) {
            $table->id('id_departamento');
            $table->string('nombre_departamento', 50)->unique();
        });

        // Tabla olimpistas
        Schema::create('olimpistas', function (Blueprint $table) {
            $table->string('ci', 15)->primary();
            $table->string('nombre', 100);
            $table->string('institucion', 150)->nullable();
            $table->string('area', 50)->nullable();
            $table->string('nivel', 50)->nullable();
            $table->string('grado', 50)->nullable();
            $table->string('contacto_tutor', 150)->nullable();

            $table->unsignedBigInteger('id_departamento');
            $table->foreign('id_departamento')->references('id_departamento')->on('departamento');
        });

        // Tabla usuario
        Schema::create('usuario', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre', 100);
            $table->string('apellidos', 100);
            $table->string('correo', 100)->unique();
            $table->string('password', 255);
            $table->string('telefono', 20)->nullable();
            $table->timestampTz('fecha_registro')->useCurrent();
            $table->boolean('activo')->default(true);
            $table->timestampTz('ultimo_acceso')->nullable();

            $table->unsignedBigInteger('id_rol');
            $table->foreign('id_rol')->references('id_rol')->on('rol');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
        Schema::dropIfExists('olimpistas');
        Schema::dropIfExists('departamento');
        Schema::dropIfExists('rol');
    }
};
