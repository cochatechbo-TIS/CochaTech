<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('area_nivel', function (Blueprint $table) {
    $table->id('id_area_nivel'); // PK
    $table->unsignedBigInteger('id_area');
    $table->unsignedBigInteger('id_nivel');
    $table->unsignedBigInteger('id_evaluador')->nullable();

    $table->foreign('id_area')->references('id_area')->on('area')->onDelete('cascade');
    $table->foreign('id_nivel')->references('id_nivel')->on('nivel')->onDelete('cascade');
    $table->foreign('id_evaluador')->references('id_evaluador')->on('evaluador')->onDelete('set null');

    $table->unique(['id_area', 'id_nivel']); // evita duplicados
});

    }

    public function down(): void {
        Schema::dropIfExists('area_nivel');
    }
};
