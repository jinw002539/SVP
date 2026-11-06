<?php

namespace App\Policies;

use App\Models\Aviso;
use App\Models\User;

class AvisoPolicy
{
    public function viewAny(User $u): bool { return $u->isStaff(); }
    public function create(User $u): bool { return $u->isStaff(); }
    public function update(User $u, Aviso $a): bool { return $u->isStaff(); }

    /** Admin apaga tudo; editor só o que ele próprio criou. */
    public function delete(User $u, Aviso $a): bool
    {
        return $u->isAdmin() || ($u->isStaff() && $a->user_id === $u->id);
    }
}
