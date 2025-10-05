<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('olimpistas', function (Blueprint $table) {
            $table->string('ci', 15)->primary();
            $table->string('nombre', 100);
            $table->string('institucion', 150)->nullable();
            $table->string('area', 50)->nullable();
            $table->string('nivel', 50)->nullable();
            $table->string('grado', 50)->nullable();
            $table->string('contacto_tutor', 150)->nullable();
            $table->unsignedBigInteger('id_departamento');
            $table->timestamps();

            $table->foreign('id_departamento')->references('id_departamento')->on('departamento');
        });
    }
    public function down(): void {
        Schema::dropIfExists('olimpistas');
    }
};