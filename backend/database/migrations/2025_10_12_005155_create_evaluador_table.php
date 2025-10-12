<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('evaluador', function (Blueprint $table) {
            $table->id('id_evaluador');
            $table->foreignId('id_usuario')->constrained('usuario', 'id_usuario');
            $table->boolean('disponible')->default(true);
            $table->foreignId('id_area')->constrained('area', 'id_area');
            $table->foreignId('id_nivel')->nullable()->constrained('nivel', 'id_nivel');
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void {
        Schema::dropIfExists('evaluador');
    }
};
