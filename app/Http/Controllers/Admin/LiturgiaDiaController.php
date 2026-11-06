<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarLiturgiaDiaRequest;
use App\Models\LiturgiaDia;
use App\Support\ImageSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class LiturgiaDiaController extends Controller
{
    private const TIPOS = ['primeira', 'salmo', 'segunda', 'evangelho'];

    public function index(): Response
    {
        Gate::authorize('viewAny', LiturgiaDia::class);

        $pagina = LiturgiaDia::orderByDesc('data')->simplePaginate(20);

        return Inertia::render('admin/liturgia/index', [
            'hoje' => now()->format('Y-m-d'),
            'dias' => [
                'data' => $pagina->getCollection()->map(fn (LiturgiaDia $d) => [
                    'id' => $d->id,
                    'data' => $d->data->format('Y-m-d'),
                    'santo_nome' => $d->santo_nome,
                    'tem_historia' => filled($d->santo_historia),
                    'tem_foto' => filled($d->santo_foto),
                    'leituras' => array_values(array_keys(array_filter((array) $d->leituras, fn ($l) => filled($l['texto'] ?? null)))),
                ])->values()->all(),
                'next_page_url' => $pagina->nextPageUrl(),
                'prev_page_url' => $pagina->previousPageUrl(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', LiturgiaDia::class);
        $data = $request->validate(['data' => ['nullable', 'date_format:Y-m-d']])['data'] ?? now()->format('Y-m-d');

        return Inertia::render('admin/liturgia/form', ['dia' => null, 'data' => $data, 'automatico' => $this->automatico($data)]);
    }

    public function store(GuardarLiturgiaDiaRequest $request): RedirectResponse
    {
        Gate::authorize('create', LiturgiaDia::class);

        $dia = new LiturgiaDia($request->safe()->only(['data', 'celebracao', 'santo_nome', 'santo_historia', 'santo_link']));
        $dia->leituras = $this->leituras($request->validated('leituras') ?? []);
        $dia->user_id = $request->user()->id;
        if ($request->hasFile('foto')) {
            $dia->santo_foto = ImageSanitizer::guardar($request->file('foto'), 'santos-manuais/'.now()->format('Y'));
        }
        $dia->save();

        return to_route('admin.liturgia.index')->with('success', 'Liturgia do dia guardada.');
    }

    public function edit(LiturgiaDia $dia): Response
    {
        Gate::authorize('update', $dia);

        return Inertia::render('admin/liturgia/form', [
            'data' => $dia->data->format('Y-m-d'),
            'automatico' => $this->automatico($dia->data->format('Y-m-d')),
            'dia' => [
                'id' => $dia->id,
                'celebracao' => $dia->celebracao,
                'santo_nome' => $dia->santo_nome,
                'santo_historia' => $dia->santo_historia,
                'santo_link' => $dia->santo_link,
                'foto' => $dia->santo_foto ? Storage::disk('uploads')->url($dia->santo_foto) : null,
                'leituras' => (object) ($dia->leituras ?? []),
            ],
        ]);
    }

    public function update(GuardarLiturgiaDiaRequest $request, LiturgiaDia $dia): RedirectResponse
    {
        Gate::authorize('update', $dia);

        $dia->fill($request->safe()->only(['data', 'celebracao', 'santo_nome', 'santo_historia', 'santo_link']));
        $dia->leituras = $this->leituras($request->validated('leituras') ?? []);

        if ($request->hasFile('foto')) {
            $this->apagarFoto($dia->santo_foto);
            $dia->santo_foto = ImageSanitizer::guardar($request->file('foto'), 'santos-manuais/'.now()->format('Y'));
        } elseif ($request->boolean('remover_foto')) {
            $this->apagarFoto($dia->santo_foto);
            $dia->santo_foto = null;
        }
        $dia->save();

        return to_route('admin.liturgia.index')->with('success', 'Liturgia do dia atualizada.');
    }

    public function destroy(LiturgiaDia $dia): RedirectResponse
    {
        Gate::authorize('delete', $dia);

        $this->apagarFoto($dia->santo_foto);
        $dia->delete();

        return to_route('admin.liturgia.index')->with('success', 'Entrada removida. O site volta a usar as fontes automáticas.');
    }

    /** Só guarda leituras com texto; ignora o resto. */
    private function leituras(array $entrada): array
    {
        $saida = [];
        foreach (self::TIPOS as $tipo) {
            $texto = trim((string) ($entrada[$tipo]['texto'] ?? ''));
            if ($texto === '') {
                continue;
            }
            $ref = trim((string) ($entrada[$tipo]['referencia'] ?? ''));
            $saida[$tipo] = ['referencia' => $ref !== '' ? $ref : null, 'texto' => $texto];
        }

        return $saida;
    }

    /** O que as fontes automáticas já trouxeram para esse dia (só lê a cache, não faz pedidos externos). */
    private function automatico(string $data): ?array
    {
        $c = Cache::get('liturgia.v1.'.str_replace('-', '', $data));
        if (! is_array($c)) {
            return null;
        }

        return [
            'leituras' => collect($c['leituras'] ?? [])->pluck('tipo')->all(),
            'santo' => $c['santo']['nome'] ?? null,
            'celebracao' => $c['celebracao'] ?? null,
        ];
    }

    private function apagarFoto(?string $caminho): void
    {
        if (! $caminho) {
            return;
        }
        try {
            Storage::disk('uploads')->delete($caminho);
        } catch (Throwable) {
            // ficheiro já não existe: sem problema
        }
    }
}
