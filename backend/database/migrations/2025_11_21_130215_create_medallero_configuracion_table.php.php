<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('medallero_configuracion', function (Blueprint $table) {
            $table->id('id_medallero_config');
            $table->foreignId('id_area')->constrained('area', 'id_area');
            $table->foreignId('id_tipo_premio')->constrained('tipo_premio', 'id_tipo_premio');
            $table->unsignedInteger('cantidad_por_nivel')->default(1);
        });
    }

    public function down(): void {
        Schema::dropIfExists('medallero_configuracion');
    }
};
