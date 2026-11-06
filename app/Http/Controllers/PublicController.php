<?php

namespace App\Http\Controllers;

use App\Models\Aviso;
use App\Models\Memoria;
use App\Services\LiturgiaService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    public const CACHE_HOME = 'public.home';

    public function home(): Response
    {
        // Cache curto: aguenta picos (domingo depois da missa) sem sobrecarregar a base de dados.
        $dados = Cache::remember(self::CACHE_HOME, 60, function () {
            $hoje = now()->toDateString();

            return [
                'urgentes' => Aviso::paraPublico()
                    ->where('anunciar_na_missa', true)
                    ->whereDate('publicar_em', '>=', now()->subDays(7)->toDateString())
                    ->orderByDesc('publicar_em')->limit(3)->get()
                    ->map->toPublico()->values()->all(),

                'eventos' => Aviso::paraPublico()
                    ->whereDate('data_evento', '>=', $hoje)
                    ->orderBy('data_evento')->limit(5)->get()
                    ->map->toPublico()->values()->all(),

                'avisos' => Aviso::paraPublico()
                    ->where('anunciar_na_missa', false)
                    ->orderByDesc('publicar_em')->orderByDesc('id')->limit(8)->get()
                    ->map->toPublico()->values()->all(),

                'memorias' => Memoria::orderByDesc('data_celebracao')->orderByDesc('id')
                    ->limit(4)->get()->map->toPublico()->values()->all(),
            ];
        });

        // Santo e leituras vêm de fontes externas: carregam DEPOIS da página (não a atrasam).
        return Inertia::render('public/home', $dados + [
            'liturgia' => Inertia::defer(fn () => app(LiturgiaService::class)->doDia()),
        ]);
    }

    public function hoje(): Response
    {
        return Inertia::render('public/hoje', [
            'liturgia' => Inertia::defer(fn () => app(LiturgiaService::class)->doDia()),
        ]);
    }

    public function calendario(Request $request): Response
    {
        $dados = $request->validate(['mes' => ['nullable', 'regex:/^\d{4}-(0[1-9]|1[0-2])$/']]);
        $mes = $dados['mes'] ?? now()->format('Y-m');
        $inicio = Carbon::createFromFormat('Y-m-d', $mes.'-01')->startOfMonth();

        $eventos = Aviso::paraPublico()
            ->whereBetween('data_evento', [$inicio->toDateString(), $inicio->copy()->endOfMonth()->toDateString()])
            ->orderBy('data_evento')->orderBy('hora_inicio')->get()
            ->map->toPublico()->values()->all();

        return Inertia::render('public/calendario', ['mes' => $mes, 'eventos' => $eventos]);
    }

    public function memorias(Request $request): Response
    {
        $dados = $request->validate(['tipo' => ['nullable', 'in:foto,video']]);

        $pagina = Memoria::query()
            ->when($dados['tipo'] ?? null, fn ($q, $tipo) => $q->where('tipo', $tipo))
            ->orderByDesc('data_celebracao')->orderByDesc('id')
            ->simplePaginate(24)->withQueryString();

        return Inertia::render('public/memorias', [
            'tipo' => $dados['tipo'] ?? null,
            'memorias' => [
                'data' => $pagina->getCollection()->map->toPublico()->values()->all(),
                'next_page_url' => $pagina->nextPageUrl(),
                'prev_page_url' => $pagina->previousPageUrl(),
            ],
        ]);
    }

    public function arquivo(Request $request): Response
    {
        $dados = $request->validate(['q' => ['nullable', 'string', 'max:60']]);
        $q = trim($dados['q'] ?? '');

        $pagina = Aviso::paraPublico()
            ->when($q !== '', fn ($x) => $x->where('assunto', 'like', '%'.addcslashes($q, '%_\\').'%'))
            ->orderByDesc('publicar_em')->orderByDesc('id')
            ->simplePaginate(15)->withQueryString();

        return Inertia::render('public/arquivo', [
            'q' => $q,
            'avisos' => [
                'data' => $pagina->getCollection()->map->toPublico()->values()->all(),
                'next_page_url' => $pagina->nextPageUrl(),
                'prev_page_url' => $pagina->previousPageUrl(),
            ],
        ]);
    }
}
