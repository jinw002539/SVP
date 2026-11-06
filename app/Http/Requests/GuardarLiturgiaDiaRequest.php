<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarLiturgiaDiaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStaff() ?? false;
    }

    public function rules(): array
    {
        return [
            'data' => ['required', 'date_format:Y-m-d', Rule::unique('liturgia_dias', 'data')->ignore($this->route('dia'))],
            'celebracao' => ['nullable', 'string', 'max:160'],
            'santo_nome' => ['nullable', 'string', 'max:160'],
            'santo_historia' => ['nullable', 'string', 'max:8000'],
            'santo_link' => ['nullable', 'url:https', 'max:300'],
            'foto' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192', 'dimensions:max_width=4600,max_height=4600'],
            'remover_foto' => ['nullable', 'boolean'],
            'leituras' => ['nullable', 'array:primeira,salmo,segunda,evangelho'],
            'leituras.*.referencia' => ['nullable', 'string', 'max:60'],
            'leituras.*.texto' => ['nullable', 'string', 'max:20000'],
        ];
    }

    public function messages(): array
    {
        return ['data.unique' => 'Já existe uma entrada para este dia. Edite essa.'];
    }
}
