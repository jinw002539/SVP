<?php

namespace App\Policies;

use App\Models\Memoria;
use App\Models\User;

class MemoriaPolicy
{
    public function viewAny(User $u): bool { return $u->isStaff(); }
    public function create(User $u): bool { return $u->isStaff(); }

    public function delete(User $u, Memoria $m): bool
    {
        return $u->isAdmin() || ($u->isStaff() && $m->user_id === $u->id);
    }
}
