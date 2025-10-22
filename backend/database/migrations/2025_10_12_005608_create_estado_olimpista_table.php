<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('estado_olimpista', function (Blueprint $table) {
            $table->id('id_estado_olimpista');
            $table->text('nombre')->unique();
        });
    }

    public function down(): void {
        Schema::dropIfExists('estado_olimpista');
    }
};