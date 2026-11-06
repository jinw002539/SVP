<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\LiturgiaDia;
use App\Models\User;
use App\Services\LiturgiaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LiturgiaManualTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Cache::flush();
    }

    public function test_texto_manual_substitui_e_completa_o_automatico(): void
    {
        Http::fake(['*' => Http::response('', 500)]);

        LiturgiaDia::forceCreate([
            'data' => now()->toDateString(),
            'santo_nome' => 'São Teste',
            'santo_historia' => "Primeiro parágrafo da história do santo.\n\nSegundo parágrafo da história.",
            'leituras' => ['evangelho' => ['referencia' => 'Lc 1,1', 'texto' => str_repeat('a', 50)]],
        ]);

        $r = app(LiturgiaService::class)->doDia(now());

        $this->assertSame('São Teste', $r['santo']['nome']);
        $this->assertCount(2, $r['santo']['historia']);
        $this->assertSame('evangelho', $r['leituras'][0]['tipo']);
        $this->assertSame('Lc 1,1', $r['leituras'][0]['referencia']);
        $this->assertTrue($r['completo']);
    }

    public function test_editor_cria_entrada_e_visitante_nao_acede(): void
    {
        $this->get('/admin/liturgia')->assertRedirect('/login');

        $editor = User::factory()->create(['role' => Role::Editor]);

        $this->actingAs($editor)->post('/admin/liturgia', [
            'data' => '2026-11-05',
            'santo_nome' => 'São Teste',
            'leituras' => ['evangelho' => ['referencia' => 'Jo 1,1', 'texto' => str_repeat('b', 60)]],
        ])->assertRedirect();

        $this->assertDatabaseHas('liturgia_dias', ['santo_nome' => 'São Teste', 'user_id' => $editor->id]);
    }

    public function test_so_uma_entrada_por_dia(): void
    {
        $editor = User::factory()->create(['role' => Role::Editor]);
        LiturgiaDia::forceCreate(['data' => '2026-11-06', 'santo_nome' => 'A']);

        $this->actingAs($editor)->post('/admin/liturgia', ['data' => '2026-11-06', 'santo_nome' => 'B'])
            ->assertSessionHasErrors('data');
    }
}
