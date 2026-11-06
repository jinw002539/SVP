<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $t) {
            $t->id();
            $t->string('slug', 40)->unique();
            $t->string('nome', 80);
            $t->string('cor', 20)->default('blue');
            $t->unsignedSmallInteger('ordem')->default(0);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};
