<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('nivel', function (Blueprint $table) {
            $table->id('id_nivel');
            $table->text('nombre')->unique();          
            $table->enum('tipo_participacion', ['individual', 'grupal'])
            ->default('individual')
            ->nullable();////ver si lo quito

        });
    }

    public function down(): void {
        Schema::dropIfExists('nivel');
    }
};
