<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Memoria extends Model
{
    use Auditable, SoftDeletes;

    protected $table = 'memorias';

    protected $fillable = ['titulo', 'data_celebracao', 'tipo', 'caminho', 'youtube_id'];

    protected function casts(): array
    {
        return ['data_celebracao' => 'date'];
    }

    /** Aceita só links reais do YouTube e devolve apenas o ID de 11 caracteres. */
    public static function extrairYoutubeId(string $link): ?string
    {
        $padrao = '~^(?:https?://)?(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:[^#]*&)?v=|shorts/|embed/|live/)|youtu\.be/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$~';

        return preg_match($padrao, trim($link), $m) ? $m[1] : null;
    }

    public function url(): ?string
    {
        return $this->caminho ? Storage::disk('uploads')->url($this->caminho) : null;
    }

    public function toPublico(): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'data_celebracao' => $this->data_celebracao->format('Y-m-d'),
            'tipo' => $this->tipo,
            'url' => $this->url(),
            'youtube_id' => $this->youtube_id,
        ];
    }
}
