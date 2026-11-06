<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

/**
 * Regista quem criou/alterou/apagou. Guarda só os NOMES dos campos
 * alterados (nunca valores), por isso não expõe dados sensíveis.
 */
trait Auditable
{
    public static function bootAuditable(): void
    {
        foreach (['created', 'updated', 'deleted'] as $evento) {
            static::{$evento}(function (Model $modelo) use ($evento) {
                $campos = null;

                if ($evento === 'updated') {
                    $campos = array_values(array_diff(
                        array_keys($modelo->getChanges()),
                        ['updated_at', 'password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes']
                    ));
                    if ($campos === []) {
                        return;
                    }
                }

                AuditLog::create([
                    'user_id' => auth()->id(),
                    'acao' => $evento,
                    'entidade' => class_basename($modelo),
                    'entidade_id' => $modelo->getKey(),
                    'campos' => $campos,
                    'ip' => app()->runningInConsole() ? null : request()->ip(),
                ]);
            });
        }
    }
}
