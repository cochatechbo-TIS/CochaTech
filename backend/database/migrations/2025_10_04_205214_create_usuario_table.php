<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('usuario', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre', 20);
            $table->string('apellidos', 500);
            $table->string('ci', 50);
            $table->string('email', 50)->unique();
            $table->string('password');
            $table->string('telefono', 20)->nullable();
            $table->string('area', 20);
            $table->unsignedBigInteger('id_rol');
            $table->rememberToken();
            $table->timestamp('ultimo_acceso')->nullable(); 
            $table->timestamp('fecha_registro')->useCurrent();
            $table->foreign('id_rol')->references('id_rol')->on('rol');
        });
    }

    public function down(): void {
        Schema::dropIfExists('usuario');
    }
};
