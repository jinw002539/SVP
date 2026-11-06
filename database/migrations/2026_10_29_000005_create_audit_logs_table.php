<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('acao', 20);        // created | updated | deleted
            $t->string('entidade', 60);
            $t->unsignedBigInteger('entidade_id')->nullable();
            $t->json('campos')->nullable(); // só NOMES dos campos alterados, nunca valores
            $t->string('ip', 45)->nullable();
            $t->timestamp('created_at')->useCurrent();

            $t->index(['entidade', 'entidade_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
