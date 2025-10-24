<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('equipo_olimpista', function (Blueprint $table) {
            $table->id('id_equipo_olimpista');
            $table->foreignId('id_equipo')->constrained('equipo', 'id_equipo')->onDelete('cascade');
            $table->foreignId('id_olimpista')->constrained('olimpista', 'id_olimpista')->onDelete('cascade');
            $table->unique(['id_equipo', 'id_olimpista']); // evita duplicados, pero vere si lo quito
        });
    }

    public function down(): void {
        Schema::dropIfExists('equipo_olimpista');
    }
};
