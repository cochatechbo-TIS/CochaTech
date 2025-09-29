<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Paso 1: quitar la PK actual de 'ci'
        DB::statement('ALTER TABLE olimpistas DROP CONSTRAINT olimpistas_pkey;');

        // Paso 2: agregar la nueva columna con autoincremento
        Schema::table('olimpistas', function (Blueprint $table) {
            $table->bigIncrements('id_olimpista')->first();
        });
    }

    public function down(): void
    {
        // Revertir: eliminar id_olimpista y volver a usar ci como PK
        Schema::table('olimpistas', function (Blueprint $table) {
            $table->dropColumn('id_olimpista');
        });

        DB::statement('ALTER TABLE olimpistas ADD PRIMARY KEY (ci);');
    }
};
