<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GuardarAvisoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStaff() ?? false; // a policy decide o resto no controlador
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'assunto' => ['required', 'string', 'max:160'],
            'contexto' => ['required', 'string', 'max:5000'],
            'publicar_em' => ['required', 'date_format:Y-m-d'],
            'data_evento' => ['nullable', 'date_format:Y-m-d'],
            'hora_inicio' => ['nullable', 'date_format:H:i'],
            'hora_fim' => ['nullable', 'date_format:H:i'],
            'local' => ['nullable', 'string', 'max:160'],
            'anunciar_na_missa' => ['required', 'boolean'],
            'status' => ['required', 'in:rascunho,publicado'],
            'itens' => ['nullable', 'array', 'max:30'],
            'itens.*' => ['required', 'string', 'max:300'],
        ];
    }
}
