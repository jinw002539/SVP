<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memorias', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('titulo', 160);
            $t->date('data_celebracao')->index();
            $t->string('tipo', 10); // foto | video
            $t->string('caminho', 255)->nullable();   // fotos: ficheiro em public/uploads
            $t->string('youtube_id', 11)->nullable(); // vídeos: só o ID do YouTube
            $t->softDeletes();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memorias');
    }
};
