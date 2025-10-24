<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('equipo', function (Blueprint $table) {
            $table->id('id_equipo');
            $table->string('nombre_equipo');
            $table->text('institucion');
            $table->foreignId('id_area')->constrained('area', 'id_area');
            $table->foreignId('id_nivel')->constrained('nivel', 'id_nivel'); // debe ser nivel grupal
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('equipo');
    }
};
