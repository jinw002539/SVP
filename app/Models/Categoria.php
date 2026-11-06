<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    protected $fillable = ['slug', 'nome', 'cor', 'ordem'];

    public function avisos(): HasMany
    {
        return $this->hasMany(Aviso::class);
    }
}
