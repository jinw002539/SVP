<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;

/** Conteúdo escrito à mão por um editor. Substitui, campo a campo, o que veio das fontes automáticas. */
class LiturgiaDia extends Model
{
    use Auditable;

    protected $table = 'liturgia_dias';

    // user_id e santo_foto são definidos pelo servidor.
    protected $fillable = ['data', 'celebracao', 'santo_nome', 'santo_historia', 'santo_link'];

    protected function casts(): array
    {
        return ['data' => 'date', 'leituras' => 'array'];
    }
}
