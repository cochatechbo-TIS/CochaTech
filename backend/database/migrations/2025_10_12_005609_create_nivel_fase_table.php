<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('nivel_fase', function (Blueprint $table) {
            $table->id('id_nivel_fase');
            $table->unsignedBigInteger('id_fase');
            $table->unsignedBigInteger('id_nivel');
            $table->unsignedBigInteger('id_estado_fase')->default(1); // En Proceso por defecto
            $table->text('comentario')->nullable();

            // Relaciones foráneas
            $table->foreign('id_fase')
                ->references('id_fase')
                ->on('fase')
                ->onDelete('cascade');

            $table->foreign('id_nivel')
                ->references('id_nivel')
                ->on('nivel')
                ->onDelete('cascade');

            $table->foreign('id_estado_fase')
                ->references('id_estado_fase')
                ->on('estado_fase')
                ->onDelete('set null');
        });
    }

    public function down(): void {
        Schema::dropIfExists('nivel_fase');
    }
};
