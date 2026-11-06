<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avisos', function (Blueprint $t) {
            $t->id();
            $t->foreignId('categoria_id')->constrained('categorias')->restrictOnDelete();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('assunto', 160);
            $t->text('contexto');
            $t->date('publicar_em')->index();
            $t->date('data_evento')->nullable()->index();
            $t->time('hora_inicio')->nullable();
            $t->time('hora_fim')->nullable();
            $t->string('local', 160)->nullable();
            $t->boolean('anunciar_na_missa')->default(false);
            $t->string('status', 20)->default('rascunho');
            $t->softDeletes();
            $t->timestamps();

            $t->index(['status', 'publicar_em']);
        });

        Schema::create('aviso_itens', function (Blueprint $t) {
            $t->id();
            $t->foreignId('aviso_id')->constrained('avisos')->cascadeOnDelete();
            $t->string('texto', 300);
            $t->unsignedSmallInteger('ordem')->default(0);

            $t->index(['aviso_id', 'ordem']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aviso_itens');
        Schema::dropIfExists('avisos');
    }
};
