<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('premiacion_olimpista', function (Blueprint $table) {
            $table->id('id_premiacion');

            $table->foreignId('id_olimpista')
                ->nullable()
                ->constrained('olimpista', 'id_olimpista')
                ->onDelete('cascade');

            $table->foreignId('id_equipo')
                ->nullable()
                ->constrained('equipo', 'id_equipo')
                ->onDelete('cascade');

            $table->foreignId('id_nivel')
                ->constrained('nivel', 'id_nivel')
                ->onDelete('cascade');

            $table->foreignId('id_tipo_premio')
                ->constrained('tipo_premio', 'id_tipo_premio');

            $table->unsignedTinyInteger('posicion'); // 1, 2, 3...
        });

        // CHECK: solo uno debe existir (individual o equipo)
        DB::statement("
            ALTER TABLE premiacion_olimpista
            ADD CONSTRAINT premiacion_individual_o_equipo
            CHECK (
                (id_olimpista IS NOT NULL AND id_equipo IS NULL)
                OR
                (id_olimpista IS NULL AND id_equipo IS NOT NULL)
            )
        ");
    }

    public function down(): void {
        Schema::dropIfExists('premiacion_olimpista');
    }
};
