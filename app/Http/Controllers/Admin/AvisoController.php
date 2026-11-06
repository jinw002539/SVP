<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PublicController;
use App\Http\Requests\GuardarAvisoRequest;
use App\Models\Aviso;
use App\Models\Categoria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AvisoController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Aviso::class);
        $filtro = $request->validate(['estado' => ['nullable', 'in:rascunho,agendado,publicado']])['estado'] ?? null;
        $hoje = now()->toDateString();

        $pagina = Aviso::with('categoria:id,nome,cor')
            ->when($filtro === 'rascunho', fn ($q) => $q->where('status', 'rascunho'))
            ->when($filtro === 'agendado', fn ($q) => $q->where('status', 'publicado')->whereDate('publicar_em', '>', $hoje))
            ->when($filtro === 'publicado', fn ($q) => $q->where('status', 'publicado')->whereDate('publicar_em', '<=', $hoje))
            ->orderByDesc('publicar_em')->orderByDesc('id')
            ->simplePaginate(20)->withQueryString();

        $user = $request->user();

        return Inertia::render('admin/avisos/index', [
            'estado' => $filtro,
            'avisos' => [
                'data' => $pagina->getCollection()->map(fn (Aviso $a) => [
                    'id' => $a->id,
                    'assunto' => $a->assunto,
                    'categoria' => ['nome' => $a->categoria->nome, 'cor' => $a->categoria->cor],
                    'publicar_em' => $a->publicar_em->format('Y-m-d'),
                    'data_evento' => $a->data_evento?->format('Y-m-d'),
                    'anunciar_na_missa' => $a->anunciar_na_missa,
                    'estado' => $this->estado($a),
                    'pode_apagar' => $user->can('delete', $a),
                ])->values()->all(),
                'next_page_url' => $pagina->nextPageUrl(),
                'prev_page_url' => $pagina->previousPageUrl(),
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Aviso::class);

        return Inertia::render('admin/avisos/form', ['aviso' => null, 'categorias' => $this->categorias()]);
    }

    public function store(GuardarAvisoRequest $request): RedirectResponse
    {
        Gate::authorize('create', Aviso::class);

        DB::transaction(function () use ($request) {
            $aviso = new Aviso($request->safe()->except('itens'));
            $aviso->user_id = $request->user()->id;
            $aviso->save();
            $this->guardarItens($aviso, $request->validated('itens') ?? []);
        });

        Cache::forget(PublicController::CACHE_HOME);

        return to_route('admin.avisos.index')->with('success', 'Aviso guardado.');
    }

    public function edit(Aviso $aviso): Response
    {
        Gate::authorize('update', $aviso);

        return Inertia::render('admin/avisos/form', [
            'aviso' => [
                'id' => $aviso->id,
                'categoria_id' => $aviso->categoria_id,
                'assunto' => $aviso->assunto,
                'contexto' => $aviso->contexto,
                'publicar_em' => $aviso->publicar_em->format('Y-m-d'),
                'data_evento' => $aviso->data_evento?->format('Y-m-d'),
                'hora_inicio' => $aviso->hora_inicio ? substr($aviso->hora_inicio, 0, 5) : null,
                'hora_fim' => $aviso->hora_fim ? substr($aviso->hora_fim, 0, 5) : null,
                'local' => $aviso->local,
                'anunciar_na_missa' => $aviso->anunciar_na_missa,
                'status' => $aviso->status,
                'itens' => $aviso->itens()->pluck('texto')->all(),
            ],
            'categorias' => $this->categorias(),
        ]);
    }

    public function update(GuardarAvisoRequest $request, Aviso $aviso): RedirectResponse
    {
        Gate::authorize('update', $aviso);

        DB::transaction(function () use ($request, $aviso) {
            $aviso->update($request->safe()->except('itens'));
            $this->guardarItens($aviso, $request->validated('itens') ?? []);
        });

        Cache::forget(PublicController::CACHE_HOME);

        return to_route('admin.avisos.index')->with('success', 'Aviso atualizado.');
    }

    public function destroy(Aviso $aviso): RedirectResponse
    {
        Gate::authorize('delete', $aviso);

        $aviso->delete(); // soft delete: pode ser recuperado da base de dados
        Cache::forget(PublicController::CACHE_HOME);

        return to_route('admin.avisos.index')->with('success', 'Aviso apagado.');
    }

    private function categorias(): array
    {
        return Categoria::orderBy('ordem')->get(['id', 'nome'])->all();
    }

    private function guardarItens(Aviso $aviso, array $itens): void
    {
        $aviso->itens()->delete();
        foreach (array_values($itens) as $i => $texto) {
            $aviso->itens()->create(['texto' => $texto, 'ordem' => $i]);
        }
    }

    private function estado(Aviso $a): string
    {
        if ($a->status === 'rascunho') {
            return 'rascunho';
        }

        return $a->publicar_em->isFuture() ? 'agendado' : 'publicado';
    }
}
