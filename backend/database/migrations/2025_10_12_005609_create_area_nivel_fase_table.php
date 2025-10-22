<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('area_nivel_fase', function (Blueprint $table) {
            $table->id('id_area_nivel_fase');
            $table->unsignedBigInteger('id_fase');
            $table->unsignedBigInteger('id_area_nivel');
            $table->text('comentario')->nullable();
            $table->string('estado_fase')->default('En Proceso');

            // Relaciones foráneas (opcional, si existen las tablas fase y area_nivel)
            $table->foreign('id_fase')
                ->references('id_fase')
                ->on('fase')
                ->onDelete('cascade');

            $table->foreign('id_area_nivel')
                ->references('id_area_nivel')
                ->on('area_nivel')
                ->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('area_nivel_fase');
    }
};