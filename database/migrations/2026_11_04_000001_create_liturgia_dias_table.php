<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('liturgia_dias', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->date('data')->unique();                    // uma entrada manual por dia
            $t->string('celebracao', 160)->nullable();
            $t->string('santo_nome', 160)->nullable();
            $t->text('santo_historia')->nullable();        // parágrafos separados por linha em branco
            $t->string('santo_foto', 255)->nullable();     // ficheiro no disco "uploads"
            $t->string('santo_link', 300)->nullable();
            $t->json('leituras')->nullable();              // {primeira|salmo|segunda|evangelho: {referencia, texto}}
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liturgia_dias');
    }
};
