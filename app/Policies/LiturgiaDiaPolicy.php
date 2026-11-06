<?php

namespace App\Policies;

use App\Models\LiturgiaDia;
use App\Models\User;

class LiturgiaDiaPolicy
{
    public function viewAny(User $u): bool { return $u->isStaff(); }
    public function create(User $u): bool { return $u->isStaff(); }
    public function update(User $u, LiturgiaDia $d): bool { return $u->isStaff(); }

    public function delete(User $u, LiturgiaDia $d): bool
    {
        return $u->isAdmin() || ($u->isStaff() && $d->user_id === $u->id);
    }
}
