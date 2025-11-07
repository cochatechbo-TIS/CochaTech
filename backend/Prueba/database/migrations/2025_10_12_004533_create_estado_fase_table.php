<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('estado_fase', function (Blueprint $table) {
            $table->id('id_estado_fase');
            $table->string('nombre_estado')->unique();
        });
    }

    public function down(): void {
        Schema::dropIfExists('estado_fase');
    }
};
