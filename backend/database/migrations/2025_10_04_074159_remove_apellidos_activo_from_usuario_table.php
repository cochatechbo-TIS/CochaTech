<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropColumn(['apellidos', 'activo']);
        });

        Schema::table('olimpistas', function (Blueprint $table) {
            $table->dropColumn('area');
        });
    }

    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->string('apellidos', 100)->nullable();
            $table->boolean('activo')->default(true);
        });

        Schema::table('olimpistas', function (Blueprint $table) {
            $table->string('area', 50)->nullable();
        });
    }
};
