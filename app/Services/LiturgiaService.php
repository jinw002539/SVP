<?php

namespace App\Services;

use Carbon\CarbonInterface;
use App\Models\LiturgiaDia;
use App\Support\ImageSanitizer;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Liturgia do dia SEM custos e sem expor os visitantes a sites de terceiros:
 *  - leituras e santo (nome): feed público do Evangelizo.org (serviço gratuito);
 *  - história e foto do santo: Wikipédia/Wikimedia (texto CC BY-SA);
 *  - a foto é descarregada UMA vez por dia, re-codificada e servida por nós.
 * Tudo vai para cache. Se alguma fonte falhar, o site continua a funcionar.
 */
class LiturgiaService
{
    private const FEED = 'https://feed.evangelizo.org/v2/reader.php';

    private const WIKI = 'https://pt.wikipedia.org/w/api.php';

    private const LEITURAS = [
        'FR' => ['primeira', '1.ª leitura'],
        'PS' => ['salmo', 'Salmo'],
        'SR' => ['segunda', '2.ª leitura'],
        'GSP' => ['evangelho', 'Evangelho'],
    ];

    public function doDia(?CarbonInterface $dia = null): array
    {
        $dia = ($dia ?? now())->copy()->startOfDay();
        $chave = 'liturgia.v1.'.$dia->format('Ymd');

        $auto = Cache::get($chave);
        if (! is_array($auto)) {
            $auto = $this->montar($dia);
            // Sucesso: 12 h. Falha: só 10 min, para tentar de novo em breve.
            Cache::put($chave, $auto, $auto['completo'] ? now()->addHours(12) : now()->addMinutes(10));
        }

        // O que um editor escreveu à mão tem prioridade e aparece logo (não passa pela cache).
        return $this->aplicarManual($auto, $dia);
    }

    public function esquecer(CarbonInterface $dia): void
    {
        Cache::forget('liturgia.v1.'.$dia->format('Ymd'));
    }

    /** Substitui, campo a campo, o automático pelo que o editor preencheu. */
    private function aplicarManual(array $d, CarbonInterface $dia): array
    {
        try {
            $m = LiturgiaDia::whereDate('data', $dia->toDateString())->first();
        } catch (Throwable $e) {
            Log::warning('Liturgia: não foi possível ler o conteúdo manual ('.$e::class.')');

            return $d;
        }
        if (! $m) {
            return $d;
        }

        if (filled($m->celebracao)) {
            $d['celebracao'] = $m->celebracao;
        }

        $santo = $d['santo'] ?? ['nome' => null, 'resumo' => null, 'historia' => [], 'foto' => null, 'link' => null];
        if (filled($m->santo_nome)) {
            $santo['nome'] = $m->santo_nome;
        }
        if (filled($m->santo_historia)) {
            $santo['historia'] = array_values(array_filter(array_map('trim', preg_split('/\R{2,}/u', (string) $m->santo_historia) ?: [])));
            $santo['resumo'] = isset($santo['historia'][0]) ? $this->encurtar($santo['historia'][0], 190) : null;
        }
        if (filled($m->santo_foto)) {
            $santo['foto'] = Storage::disk('uploads')->url($m->santo_foto);
        }
        if (filled($m->santo_link) && str_starts_with((string) $m->santo_link, 'https://')) {
            $santo['link'] = $m->santo_link;
        }
        $d['santo'] = filled($santo['nome']) ? $santo : null;

        $rotulos = ['primeira' => '1.ª leitura', 'salmo' => 'Salmo', 'segunda' => '2.ª leitura', 'evangelho' => 'Evangelho'];
        $porTipo = [];
        foreach ($d['leituras'] as $l) {
            $porTipo[$l['tipo']] = $l;
        }
        foreach ((array) $m->leituras as $tipo => $l) {
            if (! isset($rotulos[$tipo]) || ! filled($l['texto'] ?? null)) {
                continue;
            }
            $porTipo[$tipo] = [
                'tipo' => $tipo,
                'rotulo' => $rotulos[$tipo],
                'referencia' => $l['referencia'] ?? ($porTipo[$tipo]['referencia'] ?? null),
                'texto' => (string) $l['texto'],
            ];
        }
        $d['leituras'] = [];
        foreach (array_keys($rotulos) as $tipo) {
            if (isset($porTipo[$tipo])) {
                $d['leituras'][] = $porTipo[$tipo];
            }
        }

        $d['completo'] = $d['leituras'] !== [] && $d['santo'] !== null;

        return $d;
    }

    private function montar(CarbonInterface $dia): array
    {
        $d = $dia->format('Ymd');

        $pedidos = [
            'celebracao' => ['type' => 'liturgic_t'],
            'santo' => ['type' => 'saint'],
        ];
        foreach (array_keys(self::LEITURAS) as $c) {
            $pedidos[$c] = ['type' => 'reading', 'content' => $c];
            $pedidos[$c.'_ref'] = ['type' => 'reading_st', 'content' => $c];
        }
        $feed = $this->feed($d, $pedidos);

        $leituras = [];
        foreach (self::LEITURAS as $codigo => [$tipo, $rotulo]) {
            $texto = $this->limpar($feed[$codigo] ?? '');
            if (mb_strlen($texto) < 30) {
                continue;
            }
            $ref = $this->limpar($feed[$codigo.'_ref'] ?? '');
            $leituras[] = [
                'tipo' => $tipo,
                'rotulo' => $rotulo,
                'referencia' => ($ref !== '' && mb_strlen($ref) <= 60) ? $ref : null,
                'texto' => $texto,
            ];
        }

        $celebracao = $this->limpar($feed['celebracao'] ?? '');
        $santo = $this->santo($this->limpar($feed['santo'] ?? ''), $dia);

        return [
            'data' => $dia->format('Y-m-d'),
            'celebracao' => ($celebracao !== '' && mb_strlen($celebracao) <= 160) ? $celebracao : null,
            'santo' => $santo,
            'leituras' => $leituras,
            'links' => [
                'palavra' => 'https://www.vaticannews.va/pt/palavra-do-dia/'.$dia->format('Y/m/d').'.html',
                'santo' => 'https://www.vaticannews.va/pt/santo-do-dia.html',
            ],
            'completo' => $leituras !== [] && $santo !== null,
        ];
    }

    /** Pedidos em paralelo ao feed; devolve [chave => texto]. Falhas ficam vazias. */
    private function feed(string $data, array $pedidos): array
    {
        try {
            $respostas = Http::pool(function (Pool $pool) use ($data, $pedidos) {
                foreach ($pedidos as $chave => $params) {
                    $pool->as($chave)->timeout(6)->withUserAgent($this->agente())
                        ->get(self::FEED, ['date' => $data, 'lang' => 'PT'] + $params);
                }
            });
        } catch (Throwable $e) {
            Log::warning('Liturgia: feed indisponível ('.$e::class.')');

            return [];
        }

        $saida = [];
        foreach ($respostas as $chave => $r) {
            $saida[$chave] = ($r instanceof Response && $r->successful()) ? $r->body() : '';
        }

        return $saida;
    }

    private function santo(string $texto, CarbonInterface $dia): ?array
    {
        $linha = trim(explode("\n", $texto)[0] ?? '');
        if ($linha === '' || mb_strlen($linha) > 200) {
            return null;
        }

        $nome = trim(preg_replace('/\s*\([^)]*\)\s*/u', ' ', $linha));
        $busca = trim(explode(',', $nome)[0]);

        $wiki = $this->wikipedia($busca);
        $foto = ($wiki['foto'] ?? null) ? $this->guardarFoto($wiki['foto'], $dia) : null;
        $historia = $wiki['historia'] ?? [];

        return [
            'nome' => $nome,
            'resumo' => isset($historia[0]) ? $this->encurtar($historia[0], 190) : null,
            'historia' => $historia,
            'foto' => $foto,
            'link' => $wiki['link'] ?? null,
        ];
    }

    private function wikipedia(string $busca): ?array
    {
        if ($busca === '') {
            return null;
        }

        try {
            $http = $this->http();
            $os = $http->get(self::WIKI, ['action' => 'opensearch', 'search' => $busca, 'limit' => 3, 'namespace' => 0, 'format' => 'json']);
            $titulos = $os->successful() ? ($os->json(1) ?? []) : [];

            foreach (array_slice((array) $titulos, 0, 3) as $titulo) {
                $q = $http->get(self::WIKI, [
                    'action' => 'query', 'format' => 'json', 'redirects' => 1, 'titles' => $titulo,
                    'prop' => 'extracts|pageimages|info', 'inprop' => 'url',
                    'exintro' => 1, 'explaintext' => 1, 'piprop' => 'thumbnail', 'pithumbsize' => 900,
                ]);
                $pagina = collect($q->json('query.pages') ?? [])->first();
                if (! is_array($pagina) || isset($pagina['missing'])) {
                    continue;
                }

                $extrato = trim((string) ($pagina['extract'] ?? ''));
                if (! $this->pareceSanto($extrato)) {
                    continue;
                }

                $paragrafos = array_values(array_filter(
                    array_map('trim', preg_split('/\n+/u', $extrato) ?: []),
                    fn ($p) => mb_strlen($p) > 40,
                ));

                return [
                    'historia' => array_map(fn ($p) => $this->encurtar($p, 700), array_slice($paragrafos, 0, 4)),
                    'foto' => $pagina['thumbnail']['source'] ?? null,
                    'link' => isset($pagina['fullurl']) && str_starts_with($pagina['fullurl'], 'https://pt.wikipedia.org/') ? $pagina['fullurl'] : null,
                ];
            }
        } catch (Throwable $e) {
            Log::warning('Liturgia: Wikipédia indisponível ('.$e::class.')');
        }

        return null;
    }

    /** Evita "santos" errados: a página tem de falar de santos/religião e não ser desambiguação. */
    private function pareceSanto(string $extrato): bool
    {
        if ($extrato === '' || preg_match('/pode referir-se a|pode referir se a/iu', $extrato)) {
            return false;
        }

        return (bool) preg_match('/\b(santo|santa|são|beato|beata|bem-aventurad\w+|mártir|bispo|papa|religios\w+|apóstolo|canoniz\w+|igreja católica|doutor da igreja)\b/iu', $extrato);
    }

    /** Descarrega a foto (só do domínio da Wikimedia), re-codifica para WebP e guarda localmente. */
    private function guardarFoto(string $url, CarbonInterface $dia): ?string
    {
        if (parse_url($url, PHP_URL_SCHEME) !== 'https' || parse_url($url, PHP_URL_HOST) !== 'upload.wikimedia.org') {
            return null;
        }

        $disco = Storage::disk('uploads');
        $caminho = 'santos/'.$dia->format('Y').'/'.$dia->format('m-d').'.webp';

        try {
            if (! $disco->exists($caminho)) {
                $r = $this->http()->timeout(8)->get($url);
                if (! $r->successful() || strlen($r->body()) > 4_000_000) {
                    return null;
                }
                ImageSanitizer::guardarConteudo($r->body(), $caminho);
                $this->limparFotosAntigas();
            }
        } catch (Throwable $e) {
            Log::warning('Liturgia: foto do santo não guardada ('.$e::class.')');

            return null;
        }

        return $disco->url($caminho);
    }

    private function limparFotosAntigas(): void
    {
        $disco = Storage::disk('uploads');
        $limite = now()->subDays(14)->getTimestamp();
        foreach ($disco->allFiles('santos') as $ficheiro) {
            if ($disco->lastModified($ficheiro) < $limite) {
                $disco->delete($ficheiro);
            }
        }
    }

    private function http(): PendingRequest
    {
        return Http::withUserAgent($this->agente())->timeout(6)->acceptJson();
    }

    private function agente(): string
    {
        return 'ComunidadeSaoVicente/1.0 (+'.config('app.url').')';
    }

    private function encurtar(string $t, int $max): string
    {
        $t = trim($t);
        if (mb_strlen($t) <= $max) {
            return $t;
        }
        $corte = mb_substr($t, 0, $max);
        $ponto = max(mb_strrpos($corte, '. ') ?: 0, 0);

        return $ponto > $max * 0.5 ? mb_substr($corte, 0, $ponto + 1) : rtrim($corte, " ,;:").'…';
    }

    /** Texto simples e seguro: sem HTML (o React ainda escapa), com quebras de linha limpas. */
    private function limpar(?string $t): string
    {
        if ($t === null || $t === '') {
            return '';
        }
        $t = preg_replace('~<\s*br\s*/?>~i', "\n", $t);
        $t = preg_replace('~</\s*(p|div)\s*>~i', "\n\n", $t);
        $t = html_entity_decode(strip_tags($t), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $t = preg_replace('/[ \t\x{00A0}]+/u', ' ', $t);
        $t = preg_replace('/ ?\n ?/u', "\n", $t);
        $t = preg_replace('/\n{3,}/u', "\n\n", $t);

        return trim($t);
    }
}
