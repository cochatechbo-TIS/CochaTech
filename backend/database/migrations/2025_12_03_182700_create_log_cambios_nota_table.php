<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('log_cambios_nota', function (Blueprint $table) {
            $table->id('id_log');

            // Datos de auditoría
            $table->date('fecha');
            $table->time('hora');

            // Quién hizo el cambio
            $table->unsignedBigInteger('id_evaluador');
            $table->string('nombre_evaluador');

            // Contexto académico
            $table->unsignedBigInteger('id_area');
            $table->string('nombre_area');

            $table->unsignedBigInteger('id_nivel');
            $table->string('nombre_nivel');

            // Estudiante
            $table->unsignedBigInteger('id_estudiante');
            $table->string('nombre_estudiante');

            // Cambio de nota
            $table->float('nota_anterior');
            $table->float('nota_nueva');

            // Motivo del cambio (enviado por responsable)
            $table->text('motivo'); // NO NULL porque siempre habrá motivo en tu flujo

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('log_cambios_nota');
    }
};
