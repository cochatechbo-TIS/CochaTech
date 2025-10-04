<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Crear la tabla area
        Schema::create('area', function (Blueprint $table) {
            $table->id('id_area');
            $table->string('nombre_area', 100)->unique();
        });

        // 2. Agregar FK en olimpistas
        Schema::table('olimpistas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_area')->nullable()->after('grado'); 
            $table->foreign('id_area')->references('id_area')->on('area');
        });

        // 3. Agregar FK en usuario
        Schema::table('usuario', function (Blueprint $table) {
            $table->unsignedBigInteger('id_area')->nullable()->after('telefono');
            $table->foreign('id_area')->references('id_area')->on('area');
        });
    }

    public function down(): void
    {
        // Quitar la FK y columna de usuario
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropForeign(['id_area']);
            $table->dropColumn('id_area');
        });

        // Quitar la FK y columna de olimpistas
        Schema::table('olimpistas', function (Blueprint $table) {
            $table->dropForeign(['id_area']);
            $table->dropColumn('id_area');
        });

        // Eliminar la tabla area
        Schema::dropIfExists('area');
    }
};
