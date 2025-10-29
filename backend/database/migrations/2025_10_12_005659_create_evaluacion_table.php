<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('evaluacion', function (Blueprint $table) {
            $table->id('id_evaluacion');
            $table->foreignId('id_olimpista')->constrained('olimpista', 'id_olimpista');
            $table->foreignId('id_nivel_fase')->constrained('nivel_fase', 'id_nivel_fase');
            $table->decimal('nota', 5, 2)->nullable();
            $table->foreignId('id_equipo')->nullable()->constrained('equipo', 'id_equipo');/////puede que lo borre
            //$table->decimal('nota_minima', 5, 2)->nullable();
            $table->text('comentario')->nullable();
            $table->boolean('falta_etica')->default(false);
            $table->foreignId('id_estado_olimpista')->nullable()->constrained('estado_olimpista', 'id_estado_olimpista');
        });

        DB::statement("ALTER TABLE evaluacion ADD CONSTRAINT nota_check CHECK (nota BETWEEN 0 AND 100)");
        //DB::statement("ALTER TABLE evaluacion ADD CONSTRAINT nota_minima_check CHECK (nota_minima BETWEEN 0 AND 100)");
    }

    public function down(): void {
        Schema::dropIfExists('evaluacion');
    }
};