<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\GuardarUtilizadorRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('admin/utilizadores/index', [
            'utilizadores' => User::orderBy('name')->get()->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->value,
                'sou_eu' => $u->id === $request->user()->id,
            ])->all(),
        ]);
    }

    public function store(GuardarUtilizadorRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $user = new User($request->safe()->only(['name', 'email', 'password']));
        $user->role = Role::from($request->validated('role')); // role nunca é "fillable"
        $user->email_verified_at = now();
        $user->save();

        return to_route('admin.utilizadores.index')->with('success', 'Utilizador criado.');
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        $user->delete();

        return to_route('admin.utilizadores.index')->with('success', 'Utilizador removido.');
    }
}
