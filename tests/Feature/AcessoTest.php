<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\Aviso;
use App\Models\Categoria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcessoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite(); // os testes não precisam do "npm run build"
    }

    private function categoria(): Categoria
    {
        return Categoria::create(['slug' => 'avisos', 'nome' => 'Avisos', 'cor' => 'blue', 'ordem' => 1]);
    }

    private function aviso(string $assunto, string $status, ?int $userId = null): Aviso
    {
        return Aviso::forceCreate([
            'categoria_id' => $this->categoria_id ??= $this->categoria()->id,
            'user_id' => $userId,
            'assunto' => $assunto,
            'contexto' => 'Contexto',
            'publicar_em' => now()->toDateString(),
            'status' => $status,
        ]);
    }

    private ?int $categoria_id = null;

    public function test_visitante_nao_entra_na_area_restrita(): void
    {
        $this->get('/admin/avisos')->assertRedirect('/login');
    }

    public function test_publico_so_ve_avisos_publicados(): void
    {
        $this->aviso('Aviso publico visivel', 'publicado');
        $this->aviso('Rascunho secreto', 'rascunho');

        $this->get('/')->assertOk()
            ->assertSee('Aviso publico visivel')
            ->assertDontSee('Rascunho secreto');
    }

    public function test_editor_nao_gere_utilizadores(): void
    {
        $editor = User::factory()->create(['role' => Role::Editor]);

        $this->actingAs($editor)->get('/admin/utilizadores')->assertForbidden();
    }

    public function test_editor_nao_apaga_aviso_de_outro(): void
    {
        $dono = User::factory()->create(['role' => Role::Editor]);
        $outro = User::factory()->create(['role' => Role::Editor]);
        $aviso = $this->aviso('Aviso do dono', 'publicado', $dono->id);

        $this->actingAs($outro)->delete("/admin/avisos/{$aviso->id}")->assertForbidden();
        $this->actingAs($dono)->delete("/admin/avisos/{$aviso->id}")->assertRedirect();
    }

    public function test_administrador_apaga_qualquer_aviso(): void
    {
        $admin = User::factory()->create(['role' => Role::Admin]);
        $aviso = $this->aviso('Aviso qualquer', 'publicado');

        $this->actingAs($admin)->delete("/admin/avisos/{$aviso->id}")->assertRedirect();
        $this->assertSoftDeleted('avisos', ['id' => $aviso->id]);
    }

    public function test_link_do_youtube_so_aceita_youtube(): void
    {
        $this->assertSame('dQw4w9WgXcQ', \App\Models\Memoria::extrairYoutubeId('https://youtu.be/dQw4w9WgXcQ?si=abc'));
        $this->assertSame('dQw4w9WgXcQ', \App\Models\Memoria::extrairYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
        $this->assertNull(\App\Models\Memoria::extrairYoutubeId('https://evil.example/watch?v=dQw4w9WgXcQ'));
        $this->assertNull(\App\Models\Memoria::extrairYoutubeId('javascript:alert(1)'));
    }
}
