<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('usuario', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre', 100);
            $table->string('apellidos', 100);
            // CORREGIDO: Usamos 'email' para alinearlo con Laravel
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->string('telefono', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedBigInteger('id_rol');
            $table->rememberToken(); // Columna estándar de Laravel
            
            // Mapeo a tus columnas de fecha personalizadas
            $table->timestamp('fecha_registro')->nullable();
            $table->timestamp('ultimo_acceso')->nullable();

            // Definición de la llave foránea
            $table->foreign('id_rol')->references('id_rol')->on('rol');
        });
    }
    public function down(): void {
        Schema::dropIfExists('usuario');
    }
};