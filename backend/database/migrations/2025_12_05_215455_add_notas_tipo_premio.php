<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('tipo_premio', function (Blueprint $table) {
            $table->decimal('nota_minima', 5, 2)->nullable()->after('orden');
            $table->decimal('nota_maxima', 5, 2)->nullable()->after('nota_minima');
        });
    }

    public function down(): void {
        Schema::table('tipo_premio', function (Blueprint $table) {
            $table->dropColumn(['nota_minima', 'nota_maxima']);
        });
    }
};
