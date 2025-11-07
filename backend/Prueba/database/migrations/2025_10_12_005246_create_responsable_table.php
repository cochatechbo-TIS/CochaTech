<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('responsable', function (Blueprint $table) {
            $table->id('id_responsable');
            $table->foreignId('id_usuario')->constrained('usuario', 'id_usuario');
            $table->foreignId('id_area')->constrained('area', 'id_area');
        });
    }

    public function down(): void {
        Schema::dropIfExists('responsable');
    }
};
