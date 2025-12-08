<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('evaluacion', function (Blueprint $table) {
            $table->string('motivo_solicitado', 255)->nullable()->after('nota');
        });
    }

    public function down()
    {
        Schema::table('evaluacion', function (Blueprint $table) {
            $table->dropColumn('motivo_solicitado');
        });
    }
};
