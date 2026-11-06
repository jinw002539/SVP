<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $u): bool { return $u->isAdmin(); }
    public function create(User $u): bool { return $u->isAdmin(); }

    /** Ninguém se apaga a si próprio (evita ficar sem administradores). */
    public function delete(User $u, User $alvo): bool
    {
        return $u->isAdmin() && $u->id !== $alvo->id;
    }
}
