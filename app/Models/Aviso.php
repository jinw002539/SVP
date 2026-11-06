<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aviso extends Model
{
    use Auditable, SoftDeletes;

    // user_id é definido pelo servidor; nunca vem "à solta" do pedido.
    protected $fillable = [
        'categoria_id', 'assunto', 'contexto', 'publicar_em', 'data_evento',
        'hora_inicio', 'hora_fim', 'local', 'anunciar_na_missa', 'status',
    ];

    protected function casts(): array
    {
        return [
            'publicar_em' => 'date',
            'data_evento' => 'date',
            'anunciar_na_missa' => 'boolean',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function itens(): HasMany
    {
        return $this->hasMany(AvisoItem::class)->orderBy('ordem');
    }

    /** Só o que o público pode ver: publicado e já na data de publicação. */
    public function scopeVisiveis(Builder $q): Builder
    {
        return $q->where('status', 'publicado')
            ->whereDate('publicar_em', '<=', now()->toDateString());
    }

    public function scopeParaPublico(Builder $q): Builder
    {
        return $q->visiveis()->with(['categoria', 'itens']);
    }

    /** Lista branca explícita de campos: nada de user_id, emails, etc. */
    public function toPublico(): array
    {
        return [
            'id' => $this->id,
            'assunto' => $this->assunto,
            'contexto' => $this->contexto,
            'categoria' => [
                'slug' => $this->categoria->slug,
                'nome' => $this->categoria->nome,
                'cor' => $this->categoria->cor,
            ],
            'publicar_em' => $this->publicar_em->format('Y-m-d'),
            'data_evento' => $this->data_evento?->format('Y-m-d'),
            'hora_inicio' => $this->hora_inicio ? substr($this->hora_inicio, 0, 5) : null,
            'hora_fim' => $this->hora_fim ? substr($this->hora_fim, 0, 5) : null,
            'local' => $this->local,
            'anunciar_na_missa' => $this->anunciar_na_missa,
            'itens' => $this->itens->pluck('texto')->all(),
        ];
    }
}
