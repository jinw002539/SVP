<?php

namespace Tests\Feature;

use App\Services\LiturgiaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LiturgiaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Cache::flush();
    }

    public function test_le_santo_e_leituras_e_limpa_html(): void
    {
        Http::fake([
            'feed.evangelizo.org/*' => function ($request) {
                parse_str(parse_url($request->url(), PHP_URL_QUERY), $q);

                return Http::response(match ($q['type']) {
                    'saint' => 'São Martinho de Porres, religioso (1579-1639)',
                    'liturgic_t' => 'Terça-feira da 31.ª semana do Tempo Comum',
                    'reading' => '<p>Irmãos,<br />'.str_repeat('texto da leitura ', 5).'<script>alert(1)</script></p>',
                    default => 'Lc 14,15-24',
                });
            },
            'pt.wikipedia.org/*' => Http::response(['query' => []], 200),
        ]);

        $r = app(LiturgiaService::class)->doDia(now());

        $this->assertSame('São Martinho de Porres, religioso', $r['santo']['nome']);
        $this->assertCount(4, $r['leituras']);
        $this->assertStringNotContainsString('<', $r['leituras'][0]['texto']);
        $this->assertSame('Lc 14,15-24', $r['leituras'][3]['referencia']);
        $this->assertStringContainsString('vaticannews.va/pt/palavra-do-dia/', $r['links']['palavra']);
    }

    public function test_falha_das_fontes_nao_parte_o_site(): void
    {
        Http::fake(['*' => Http::response('', 500)]);

        $r = app(LiturgiaService::class)->doDia(now());
        $this->assertFalse($r['completo']);
        $this->assertSame([], $r['leituras']);
        $this->assertNull($r['santo']);

        $this->get('/hoje')->assertOk();
        $this->get('/')->assertOk();
    }
}
