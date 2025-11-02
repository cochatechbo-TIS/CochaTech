<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
       Schema::create('fase', function (Blueprint $table) {
    $table->id('id_fase');
    $table->text('nombre');
    $table->unsignedTinyInteger('orden');
    $table->unsignedTinyInteger('nota_minima')->nullable();
    $table->foreignId('iniciado_por')->nullable()->constrained('usuario', 'id_usuario');
    $table->timestampTz('iniciado_timestamp')->nullable();
    $table->foreignId('finalizado_por')->nullable()->constrained('usuario', 'id_usuario');
    $table->timestampTz('finalizado_timestamp')->nullable();

});

    }

    public function down(): void {
        Schema::dropIfExists('fase');
    }
};