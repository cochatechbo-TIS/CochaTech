<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('nivel', function (Blueprint $table) {
            $table->id('id_nivel');
            $table->text('nombre')->unique(); 
            $table->unsignedBigInteger('id_area');
            $table->unsignedBigInteger('id_evaluador')->nullable();         
            $table->boolean('es_grupal')->default(false);

            // Llaves foráneas
            $table->foreign('id_area')->references('id_area')->on('area')->onDelete('cascade');
            $table->foreign('id_evaluador')->references('id_evaluador')->on('evaluador')->onDelete('set null');
        });
    }

    public function down(): void {
        Schema::dropIfExists('nivel');
    }
};
