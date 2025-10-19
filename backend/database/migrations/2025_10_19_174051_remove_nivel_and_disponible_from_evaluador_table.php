<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('evaluador', function (Blueprint $table) {
            // 1. Eliminar la llave foránea ANTES de eliminar la columna
            // El nombre de la foránea es autogenerado por Laravel: 'tabla_columna_foreign'
            $table->dropForeign(['id_nivel']);

            // 2. Eliminar las columnas
            $table->dropColumn('id_nivel');
            $table->dropColumn('disponible');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluador', function (Blueprint $table) {
            // Para poder revertir: re-añadir las columnas
            $table->boolean('disponible')->default(true)->after('id_area');
            $table->foreignId('id_nivel')->nullable()->after('id_area')->constrained('nivel', 'id_nivel');
        });
    }
};