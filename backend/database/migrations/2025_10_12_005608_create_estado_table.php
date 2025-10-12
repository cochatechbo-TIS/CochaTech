<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('estado', function (Blueprint $table) {
            $table->id('id_estado');
            $table->text('nombre')->unique();
        });
    }

    public function down(): void {
        Schema::dropIfExists('estado');
    }
};
