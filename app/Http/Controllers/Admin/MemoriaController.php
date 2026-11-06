<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PublicController;
use App\Http\Requests\GuardarMemoriaRequest;
use App\Models\Memoria;
use App\Support\ImageSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MemoriaController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Memoria::class);
        $user = $request->user();

        $pagina = Memoria::orderByDesc('data_celebracao')->orderByDesc('id')
            ->simplePaginate(24)->withQueryString();

        return Inertia::render('admin/memorias/index', [
            'memorias' => [
                'data' => $pagina->getCollection()->map(fn (Memoria $m) => $m->toPublico() + [
                    'pode_apagar' => $user->can('delete', $m),
                ])->values()->all(),
                'next_page_url' => $pagina->nextPageUrl(),
                'prev_page_url' => $pagina->previousPageUrl(),
            ],
        ]);
    }

    public function store(GuardarMemoriaRequest $request): RedirectResponse
    {
        Gate::authorize('create', Memoria::class);

        $memoria = new Memoria([
            'titulo' => $request->validated('titulo'),
            'data_celebracao' => $request->validated('data_celebracao'),
            'tipo' => $request->validated('tipo'),
        ]);
        $memoria->user_id = $request->user()->id;

        if ($memoria->tipo === 'foto') {
            $memoria->caminho = ImageSanitizer::guardar(
                $request->file('foto'),
                'memorias/'.now()->format('Y/m')
            );
        } else {
            $memoria->youtube_id = Memoria::extrairYoutubeId($request->validated('youtube'));
        }

        $memoria->save();
        Cache::forget(PublicController::CACHE_HOME);

        return to_route('admin.memorias.index')->with('success', 'Memória adicionada.');
    }

    public function destroy(Memoria $memoria): RedirectResponse
    {
        Gate::authorize('delete', $memoria);

        $memoria->delete(); // soft delete; o ficheiro fica em disco até limpeza manual
        Cache::forget(PublicController::CACHE_HOME);

        return to_route('admin.memorias.index')->with('success', 'Memória removida.');
    }
}
