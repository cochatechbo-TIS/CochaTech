<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('olimpista', function (Blueprint $table) {
            $table->id('id_olimpista');
            $table->text('nombre');
            $table->text('apellidos');
            $table->string('ci', 15);
            $table->text('institucion');
            $table->foreignId('id_area')->constrained('area', 'id_area');
            $table->foreignId('id_nivel')->constrained('nivel', 'id_nivel');
            $table->text('grado')->nullable();
            $table->text('contacto_tutor')->nullable();
            $table->text('nombre_tutor')->nullable();
            $table->foreignId('id_departamento')->constrained('departamento', 'id_departamento');
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void {
        Schema::dropIfExists('olimpista');
    }
};
