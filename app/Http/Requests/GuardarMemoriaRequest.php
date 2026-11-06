<?php

namespace App\Http\Requests;

use App\Models\Memoria;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class GuardarMemoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStaff() ?? false;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:160'],
            'data_celebracao' => ['required', 'date_format:Y-m-d'],
            'tipo' => ['required', 'in:foto,video'],
            'foto' => [
                'required_if:tipo,foto', 'nullable', 'file', 'image',
                'mimes:jpg,jpeg,png,webp', 'max:8192',
                'dimensions:max_width=4600,max_height=4600',
            ],
            'youtube' => [
                'required_if:tipo,video', 'nullable', 'string', 'max:200',
                function (string $attr, mixed $valor, Closure $fail) {
                    if ($this->input('tipo') === 'video' && ! Memoria::extrairYoutubeId((string) $valor)) {
                        $fail('Link do YouTube inválido.');
                    }
                },
            ],
        ];
    }
}
