<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('usuario', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->text('nombre');
            $table->text('apellidos');
            $table->string('ci', 15)->unique();
            $table->text('email')->unique();
            $table->text('password');
            $table->char('telefono', 8)->nullable();
            $table->foreignId('id_rol')->constrained('rol', 'id_rol');
            $table->timestampTz('ultimo_acceso')->nullable();
            $table->date('fecha_registro')->default(DB::raw('CURRENT_DATE'));
        });

        //  Añadir el CHECK después de crear la tabla
        DB::statement("ALTER TABLE usuario ADD CONSTRAINT telefono_check CHECK (telefono ~ '^[0-9]{8}$')");
    }

    public function down(): void {
        Schema::dropIfExists('usuario');
    }
};
