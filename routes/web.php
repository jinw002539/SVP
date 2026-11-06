<?php

use App\Http\Controllers\Admin\AvisoController;
use App\Http\Controllers\Admin\LiturgiaDiaController;
use App\Http\Controllers\Admin\MemoriaController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

/*
 |--------------------------------------------------------------------------
 | Parte pública: só leitura, sem login. Limite de pedidos por IP.
 |--------------------------------------------------------------------------
 */
Route::middleware('throttle:120,1')->group(function () {
    Route::get('/', [PublicController::class, 'home'])->name('home');
    Route::get('/hoje', [PublicController::class, 'hoje'])->name('hoje');
    Route::get('/calendario', [PublicController::class, 'calendario'])->name('calendario');
    Route::get('/memorias', [PublicController::class, 'memorias'])->name('memorias');
    Route::get('/arquivo', [PublicController::class, 'arquivo'])->name('arquivo');
});

/*
 |--------------------------------------------------------------------------
 | Área restrita: precisa de sessão + papel (admin ou editor).
 |--------------------------------------------------------------------------
 */
Route::middleware(['auth', 'role:admin,editor', 'throttle:60,1'])
    ->prefix('admin')->name('admin.')->group(function () {
        Route::redirect('/', '/admin/avisos');

        Route::resource('avisos', AvisoController::class)
            ->parameters(['avisos' => 'aviso'])->except('show');

        Route::resource('memorias', MemoriaController::class)
            ->parameters(['memorias' => 'memoria'])->only(['index', 'store', 'destroy']);

        // Santo e leituras escritos à mão (substituem o automático).
        Route::resource('liturgia', LiturgiaDiaController::class)
            ->parameters(['liturgia' => 'dia'])->except('show');

        // Só administradores gerem utilizadores.
        Route::middleware('role:admin')->group(function () {
            Route::resource('utilizadores', UserController::class)
                ->parameters(['utilizadores' => 'user'])->only(['index', 'store', 'destroy']);
        });
    });

// O starter kit referencia a rota "dashboard"; mantemos o nome e enviamos para o painel.
Route::redirect('/dashboard', '/admin/avisos')->middleware('auth')->name('dashboard');

require __DIR__.'/settings.php';
